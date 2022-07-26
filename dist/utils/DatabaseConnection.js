"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnections = void 0;
require("dotenv/config");
const systems = [
    {
        _id: 'EXPORT',
        bd_name: process.env.EXPORT_BD_NAME,
        bd_pass: process.env.EXPORT_BD_PASS,
        bd_user: process.env.EXPORT_BD_USER,
        ip_bd: process.env.EXPORT_IP_BD,
        ip_host: process.env.EXPORT_IP_HOST,
        ip_ftp: process.env.EXPORT_IP_FTP,
        pass_ftp: process.env.EXPORT_FTP_PASS,
        user_ftp: process.env.EXPORT_FTP_USER,
        database_type: process.env.DATABASE_TYPE,
        document_folder: process.env.EXPORT_DOCUMENT_FOLDER,
        proyect_folder: process.env.EXPORT_PROYECT_FOLDER,
        proyect_main_folder: process.env.EXPORT_PROYECT_MAIN_FOLDER,
        system_image_path: process.env.EXPORT_IMAGE_PATH,
        compressed_image_folder: process.env.EXPORT_COMPRESSED_IMAGE_FOLDER
    },
    {
        _id: 'VEGETABLES',
        bd_name: process.env.VEGETABLES_BD_NAME,
        bd_pass: process.env.VEGETABLES_BD_PASS,
        bd_user: process.env.VEGETABLES_BD_USER,
        ip_bd: process.env.VEGETABLES_IP_BD,
        ip_host: process.env.VEGETABLES_IP_HOST,
        ip_ftp: process.env.VEGETABLES_IP_FTP,
        pass_ftp: process.env.VEGETABLES_FTP_PASS,
        user_ftp: process.env.VEGETABLES_FTP_USER,
        database_type: process.env.DATABASE_TYPE,
        document_folder: process.env.VEGETABLES_DOCUMENT_FOLDER,
        proyect_folder: process.env.VEGETABLES_PROYECT_FOLDER,
        proyect_main_folder: process.env.VEGETABLES_PROYECT_MAIN_FOLDER,
        system_image_path: process.env.VEGETABLES_IMAGE_PATH,
        compressed_image_folder: process.env.VEGETABLES_COMPRESSED_IMAGE_FOLDER
    }
];
class DatabaseConnections {
    constructor(_id) {
        this._id = _id;
    }
    getSystem() {
        const selectedSystem = systems.find(system => system._id === this._id);
        return selectedSystem;
    }
}
exports.DatabaseConnections = DatabaseConnections;
