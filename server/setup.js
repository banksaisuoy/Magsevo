const { Database, User, Category, Video, Settings } = require('./models/index');
const path = require('path');

async function setupDatabase() {
    console.log('Setting up VisionHub database...');

    // FIXED: Use DB_PATH if available
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'visionhub.db');
    const database = new Database(dbPath);

    try {
        await database.connect();

        // Initialize tables (reused from server.js logic essentially)
        // We assume database.run works (if Database.js is fixed version)

        // Seed initial data
        console.log('Seeding initial data...');

        // Create default users
        try {
            await User.create(database, { username: 'admin', password: '123456', role: 'admin' });
            console.log('✓ Created admin user');
        } catch (err) {
            console.log('✓ Admin user check: ' + err.message);
        }

        try {
            await User.create(database, { username: 'user', password: '123456', role: 'user' });
            console.log('✓ Created test user');
        } catch (err) {
            console.log('✓ Test user check: ' + err.message);
        }

        // Create default categories
        const categories = ['Development', 'Design', 'Marketing'];
        const catMap = {};
        for (const categoryName of categories) {
             // Try insert
             await new Promise(resolve => {
                 database.db.run(`INSERT OR IGNORE INTO categories (name) VALUES (?)`, [categoryName], () => resolve());
             });

             // Get ID
             const row = await new Promise(resolve => {
                 database.db.get(`SELECT id FROM categories WHERE name = ?`, [categoryName], (err, row) => resolve(row));
             });

             if (row) {
                 catMap[categoryName] = row.id;
                 console.log(`✓ Category: ${categoryName}`);
             }
        }

        // Create default videos
        const videos = [
            {
                title: 'Introduction to Web Development',
                description: 'An introductory course to web development fundamentals, covering HTML, CSS, and JavaScript.',
                thumbnailUrl: 'https://placehold.co/400x225/2a9d8f/c9d1d9?text=WebDev',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                views: 1500,
                isFeatured: 1,
                categoryName: 'Development'
            },
            {
                title: 'Getting Started with UI/UX Design',
                description: 'Learn the basics of user interface and user experience design.',
                thumbnailUrl: 'https://placehold.co/400x225/e9c46a/264653?text=UI/UX',
                videoUrl: 'https://www.youtube.com/watch?v=S01mP-mR8Ew',
                views: 800,
                isFeatured: 0,
                categoryName: 'Design'
            },
            {
                title: 'The Power of Digital Marketing',
                description: 'A guide to digital marketing strategies and tools for your business.',
                thumbnailUrl: 'https://placehold.co/400x225/f4a261/264653?text=Marketing',
                videoUrl: 'https://www.youtube.com/watch?v=N_x011_x-wU',
                views: 1200,
                isFeatured: 0,
                categoryName: 'Marketing'
            },
            {
                title: 'JavaScript Advanced Concepts',
                description: 'Deep dive into advanced topics in JavaScript programming language.',
                thumbnailUrl: 'https://placehold.co/400x225/e76f51/264653?text=JS+Advanced',
                videoUrl: 'https://www.youtube.com/watch?v=XF-gqK7yB1A',
                views: 2500,
                isFeatured: 0,
                categoryName: 'Development'
            },
            {
                title: 'Introduction to Figma',
                description: 'Master the basics of Figma, a powerful tool for collaborative design.',
                thumbnailUrl: 'https://placehold.co/400x225/264653/e9c46a?text=Figma',
                videoUrl: 'https://www.youtube.com/watch?v=Ft7L7X7N-6o',
                views: 600,
                isFeatured: 0,
                categoryName: 'Design'
            }
        ];

        for (const video of videos) {
            const catId = catMap[video.categoryName];
            if (catId) {
                const videoData = { ...video, categoryId: catId };
                delete videoData.categoryName;

                try {
                    await Video.create(database, videoData);
                    console.log(`✓ Created video: ${video.title}`);
                } catch (err) {
                    console.log(`✓ Video '${video.title}' check: ${err.message}`);
                }
            } else {
                console.warn(`Skipping video ${video.title}: Category ${video.categoryName} not found.`);
            }
        }

        // Settings
        await Settings.set(database, 'siteName', 'VisionHub');
        await Settings.set(database, 'primaryColor', '#2a9d8f');

        // Create default report reasons
        const defaultReasons = [
            'Inappropriate content',
            'Spam',
            'Copyright violation',
            'Misleading content',
            'Violence or harmful content',
            'Hate speech',
            'Other'
        ];

        for (const reason of defaultReasons) {
             // Assuming direct insert or ReportReason model if available
             // Using raw sql to be safe
             database.run('INSERT OR IGNORE INTO report_reasons (reason) VALUES (?)', [reason]);
        }

        console.log('Database setup completed.');

    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await database.close();
    }
}

if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };
