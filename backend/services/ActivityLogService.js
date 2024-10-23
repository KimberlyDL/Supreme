const activityLog = async (db, {
    userId,
    action,
    description,
    role,
    branchId = null,
    entityType = null,
    entityId = null,
    status = 'success',
    ipAddress = null
}) => {
    const logEntry = {
        userId,
        action,
        description,
        role,
        branchId,
        entityType,
        entityId,
        status,
        ipAddress,
        timestamp: new Date().toISOString(),
    };

    try {
        await db.collection('activityLogs').add(logEntry);
        console.log('Activity logged:', logEntry);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = activityLog;


//this is classbased

// class ActivityLogService {
//     constructor(db) {
//         this.db = db;
//     }

//     async logAction({
//         userId,
//         action,
//         description,
//         role,
//         branchId = null,
//         entityType = null,
//         entityId = null,
//         status = 'success',  // Default status to 'success'
//         ipAddress = null
//     }) {
//         const logEntry = {
//             userId,
//             action,
//             description,
//             role,
//             branchId,
//             entityType,
//             entityId,
//             status,
//             ipAddress,
//             timestamp: new Date().toISOString(),
//         };

//         try {
//             await this.db.collection('activityLogs').add(logEntry);
//             console.log('Activity logged:', logEntry);
//         } catch (error) {
//             console.error('Error logging activity:', error);
//         }
//     }
// }

// let instance = null;
// const initActivityLogService = (db) => {
//     if (!instance) {
//         instance = new ActivityLogService(db);
//     }
//     return instance;
// };

// module.exports = initActivityLogService;
