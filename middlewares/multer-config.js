import multer, { diskStorage } from "multer";
import path, { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

export default function (image) {
    return multer({
        //configuration du stockage
        storage: diskStorage({
            //config l'emplacement du stockage
            destination: (req, file, callback) => {
                const __dirname = dirname(fileURLToPath(import.meta.url)); //recuperer le chemin du dossier courant
                callback(null, join(__dirname, "../public/images")); //indiquer l'emplacement de stockage
            },
            //configurer le nom avec lequel le fichier va etre enregistrer
            filename: (req, file, callback) => {
                //remplacer les espaces par des underscores
                const name = path.parse(file.originalname.split(" ").join("_")).name
                //recuperer l'extension à utiliser pour le fichier
                const extension = extname(file.originalname);
                //ajouter un timestamp Date.now() au nom du fichier
                callback(null, name + Date.now() + extension);
            },
        }),
        //taille max des images 10Mo
        limits: 10 * 1024 * 1024,
    }).single(image); //le fichier est envoyé dans le body avec nom/clé 'pic'
}