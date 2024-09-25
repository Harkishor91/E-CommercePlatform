
// // middlewares/upload.js
// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Folder must exist
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const filetypes = /jpeg|jpg|png/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 1000000 } // 1 MB limit
// });

// module.exports = upload;



const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, 'uploads/');
  },
  filename: function (req, file, next) {
    const filename = `${file.fieldname}_${Date.now()}_${file.originalname}`;
    next(null, filename);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;