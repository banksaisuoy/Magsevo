const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'visionhub.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create tables
        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                fullName TEXT,
                department TEXT,
                employeeId TEXT,
                email TEXT,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                thumbnailUrl TEXT,
                videoUrl TEXT NOT NULL,
                optimizedUrl TEXT,
                views INTEGER DEFAULT 0,
                isFeatured BOOLEAN DEFAULT 0,
                categoryId INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(categoryId) REFERENCES categories(id)
            )`
        ];

        console.log('Creating database tables...');
        let created = 0;
        
        function createTable(index) {
            if (index >= tables.length) {
                console.log(`✓ Created ${created} tables`);
                // Add some sample data
                seedData();
                return;
            }
            
            const table = tables[index];
            db.run(table, (err) => {
                if (err) {
                    console.error('Error creating table:', err.message);
                } else {
                    created++;
                    console.log(`✓ Created table ${index + 1}`);
                }
                createTable(index + 1);
            });
        }
        
        function seedData() {
            console.log('Seeding initial data...');
            
            // Insert categories
            const categories = ['Development', 'Design', 'Marketing'];
            let catIndex = 0;
            
            function insertCategory() {
                if (catIndex >= categories.length) {
                    insertVideos();
                    return;
                }
                
                const cat = categories[catIndex];
                db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [cat], (err) => {
                    if (err) {
                        console.error('Error inserting category:', err.message);
                    } else {
                        console.log(`✓ Inserted category: ${cat}`);
                    }
                    catIndex++;
                    insertCategory();
                });
            }
            
            // Insert videos
            function insertVideos() {
                const videos = [
                    {
                        title: 'Introduction to Web Development',
                        description: 'An introductory course to web development fundamentals, covering HTML, CSS, and JavaScript.',
                        thumbnailUrl: 'https://placehold.co/400x225/2a9d8f/c9d1d9?text=WebDev',
                        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        categoryId: 1,
                        isFeatured: 1
                    },
                    {
                        title: 'Getting Started with UI/UX Design',
                        description: 'Learn the basics of user interface and user experience design.',
                        thumbnailUrl: 'https://placehold.co/400x225/e9c46a/264653?text=UI/UX',
                        videoUrl: 'https://www.youtube.com/watch?v=S01mP-mR8Ew',
                        categoryId: 2,
                        isFeatured: 1
                    },
                    {
                        title: 'The Power of Digital Marketing',
                        description: 'A guide to digital marketing strategies and tools for your business.',
                        thumbnailUrl: 'https://placehold.co/400x225/f4a261/264653?text=Marketing',
                        videoUrl: 'https://www.youtube.com/watch?v=N_x011_x-wU',
                        categoryId: 3,
                        isFeatured: 1
                    }
                ];
                
                let vidIndex = 0;
                
                function insertVideo() {
                    if (vidIndex >= videos.length) {
                        console.log('✓ Seeding completed');
                        db.close();
                        return;
                    }
                    
                    const video = videos[vidIndex];
                    const sql = `INSERT OR IGNORE INTO videos 
                        (title, description, thumbnailUrl, videoUrl, categoryId, isFeatured) 
                        VALUES (?, ?, ?, ?, ?, ?)`;
                    
                    const params = [
                        video.title,
                        video.description,
                        video.thumbnailUrl,
                        video.videoUrl,
                        video.categoryId,
                        video.isFeatured ? 1 : 0
                    ];
                    
                    db.run(sql, params, (err) => {
                        if (err) {
                            console.error('Error inserting video:', err.message);
                        } else {
                            console.log(`✓ Inserted video: ${video.title}`);
                        }
                        vidIndex++;
                        insertVideo();
                    });
                }
                
                insertVideo();
            }
            
            insertCategory();
        }
        
        createTable(0);
    }
});