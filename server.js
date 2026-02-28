const express = require('express');
const multer = require('multer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// إنشاء ملف توقيع (Keystore) تلقائي لو مش موجود
const keystorePath = path.join(__dirname, 'my-key.keystore');
if (!fs.existsSync(keystorePath)) {
    console.log('🔑 جاري إنشاء ملف التوقيع...');
    execSync(`keytool -genkey -v -keystore ${keystorePath} -alias my-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass 123456 -keypass 123456 -dname "CN=Clone, OU=App, O=Dev, L=City, S=State, C=US"`);
}

app.post('/clone', upload.single('apkFile'), (req, res) => {
    try {
        const file = req.file;
        const appName = req.body.appName;
        const pkgName = req.body.pkgName;
        
        const uploadedPath = file.path;
        const workDir = path.join(__dirname, 'uploads', file.filename + '_work');
        const outputApk = path.join(__dirname, 'uploads', file.filename + '_cloned.apk');

        console.log('🚀 جاري الفك التشفير...');
        execSync(`apktool d -f ${uploadedPath} -o ${workDir}`);
        
        console.log('📝 جاري تعديل اسم الحزمة...');
        const manifestPath = path.join(workDir, 'AndroidManifest.xml');
        let manifest = fs.readFileSync(manifestPath, 'utf8');
        manifest = manifest.replace(/package="[^"]+"/g, `package="${pkgName}"`);
        fs.writeFileSync(manifestPath, manifest);

        console.log('📦 جاري إعادة التجميع...');
        execSync(`apktool b -f ${workDir} -o ${outputApk}`);

        console.log('✍️ جاري التوقيع (Signing)...');
        execSync(`apksigner sign --ks ${keystorePath} --ks-pass pass:123456 --out ${outputApk} ${outputApk}`);

        console.log('✅ تمت العملية بنجاح!');
        res.download(outputApk, `${appName}.apk`);

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        res.status(500).send('حصل خطأ أثناء عملية النسخ، تأكد من ملف الـ APK.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال وجاهز!`);
});

