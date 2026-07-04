const backupService = require('../../server/services/backupService');
const videoCompression = require('../../server/services/videoCompression');
const fs = require('fs').promises;

jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn().mockResolvedValue(true),
        copyFile: jest.fn().mockResolvedValue(true),
        stat: jest.fn().mockResolvedValue({ size: 1024, birthtime: new Date() }),
        writeFile: jest.fn().mockResolvedValue(true),
        access: jest.fn().mockResolvedValue(true),
        readdir: jest.fn().mockResolvedValue(['visionhub-db-2023.db', 'visionhub-files-2023.zip']),
        unlink: jest.fn().mockResolvedValue(true)
    }
}));

jest.mock('child_process', () => ({
    exec: jest.fn((cmd, cb) => cb(null, { stdout: '', stderr: '' }))
}));

jest.mock('fluent-ffmpeg', () => {
    return function() {
        return {
            outputOptions: jest.fn().mockReturnThis(),
            output: jest.fn().mockReturnThis(),
            screenshots: jest.fn().mockReturnThis(),
            on: jest.fn().mockImplementation(function(event, cb) {
                if (event === 'end') {
                    // asynchronously call end callback
                    setTimeout(cb, 0);
                }
                return this;
            }),
            run: jest.fn().mockImplementation(function() {})
        };
    };
});

describe('Backend Services', () => {
    describe('Backup Service', () => {
        test('getStatus returns correct info', () => {
            const status = backupService.getStatus();
            expect(status).toHaveProperty('backupPath');
            expect(status).toHaveProperty('dbPath');
        });

        test('backupDatabase creates a backup successfully', async () => {
            const result = await backupService.backupDatabase();
            expect(result.success).toBe(true);
            expect(result.type).toBe('database');
        });

        test('listBackups lists backups properly', async () => {
            const result = await backupService.listBackups();
            expect(result.success).toBe(true);
            expect(result.backups.length).toBe(2);
        });
    });

    describe('Video Compression Service', () => {
        beforeAll(() => {
            videoCompression.compressionEnabled = true; // ensure enabled for tests
        });

        test('getStatus returns correct info', () => {
            const status = videoCompression.getStatus();
            expect(status).toHaveProperty('enabled');
            expect(status).toHaveProperty('uploadsPath');
        });

        test('compressVideo works with mocked ffmpeg', async () => {
            const result = await videoCompression.compressVideo('input.mp4', 'output.mp4');
            expect(result.success).toBe(true);
        });

        test('generateThumbnail works with mocked ffmpeg', async () => {
            const result = await videoCompression.generateThumbnail('input.mp4', 'output.jpg');
            expect(result.success).toBe(true);
        });
    });
});
