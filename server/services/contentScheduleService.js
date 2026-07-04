const { ContentSchedule } = require('../models/index');

class ContentScheduleService {
    constructor() {
        this.db = null;
    }

    setDatabase(db) {
        this.db = db;
    }

    async initialize() {
        // Initialization using existing this.db
    }

    async createSchedule(scheduleData) {
        try {
            await this.initialize();
            const result = await ContentSchedule.create(this.db, scheduleData);
            return { success: true, scheduleId: result.id };
        } catch (error) {
            console.error('Error creating schedule:', error);
            return { success: false, error: error.message };
        } finally {
            // await this.db.close(); // Shared connection
        }
    }

    async getSchedules() {
        try {
            await this.initialize();
            const schedules = await ContentSchedule.getAll(this.db);
            return { success: true, schedules };
        } catch (error) {
            console.error('Error getting schedules:', error);
            return { success: false, error: error.message };
        } finally {
            // await this.db.close(); // Shared connection
        }
    }

    async getScheduleById(id) {
        try {
            await this.initialize();
            const schedule = await ContentSchedule.getById(this.db, id);
            return { success: true, schedule };
        } catch (error) {
            console.error('Error getting schedule:', error);
            return { success: false, error: error.message };
        } finally {
            // await this.db.close(); // Shared connection
        }
    }

    async updateSchedule(id, scheduleData) {
        try {
            await this.initialize();
            await ContentSchedule.update(this.db, id, scheduleData);
            return { success: true };
        } catch (error) {
            console.error('Error updating schedule:', error);
            return { success: false, error: error.message };
        } finally {
            // await this.db.close(); // Shared connection
        }
    }

    async executeSchedule(id) {
        try {
            await this.initialize();
            await ContentSchedule.execute(this.db, id);
            return { success: true };
        } catch (error) {
            console.error('Error executing schedule:', error);
            return { success: false, error: error.message };
        } finally {
            // await this.db.close(); // Shared connection
        }
    }

    async cancelSchedule(id) {
        try {
            await this.initialize();
            await ContentSchedule.cancel(this.db, id);
            return { success: true };
        } catch (error) {
            console.error('Error canceling schedule:', error);
            return { success: false, error: error.message };
        } finally {
            // await this.db.close(); // Shared connection
        }
    }

    async getPendingSchedules() {
        try {
            await this.initialize();
            const schedules = await ContentSchedule.getPending(this.db);
            return { success: true, schedules };
        } catch (error) {
            console.error('Error getting pending schedules:', error);
            return { success: false, error: error.message };
        } finally {
            // await this.db.close(); // Shared connection
        }
    }
}

module.exports = ContentScheduleService;