const fs = require('fs');

module.exports = {
    uploadAvatar: function(file) {
        const processedFile = file || {};
        let orgFileName = processedFile.originalname || ''; // Original file name in computer user;
        orgFileName = orgFileName.trim().replace(/ /g, "-");
        const fullPathInServ = processedFile.path; // Full path file upload to server
        // rename file name uploaded, because multer is defaulting to no file extension
        const newFullPath = `${fullPathInServ}-${orgFileName}`;
        const newNameFile = `${processedFile.filename}-${orgFileName}`;
        fs.renameSync(fullPathInServ, newFullPath);
        return {
            status: true,
            message: 'File uploaded',
            fileNameInServ: newNameFile
        }
    }
}