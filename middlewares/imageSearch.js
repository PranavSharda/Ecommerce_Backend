import tf from '@tensorflow/tfjs';
import cocoSsd from '@tensorflow-models/coco-ssd'; 
import { createCanvas, loadImage } from 'canvas';


export const ProductsByImage = async (req, res,next) => {
    try {
        const imagePath =req.body.imageUrl;
        const image = await loadImage(imagePath);
        const model = await cocoSsd.load();

        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha === 0) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        const processedImage = canvas;

        const predictions = await model.detect(processedImage);
        req.search=predictions[0].class;
        console.log(predictions+" "+req.search);
        next();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};