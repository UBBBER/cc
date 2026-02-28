# هنستخدم نسخة لينكس خفيفة عليها Node.js
FROM node:18-bullseye

# تسطيب Java وأدوات الأندرويد للتوقيع
RUN apt-get update && \
    apt-get install -y default-jre apksigner wget && \
    apt-get clean

# تسطيب أداة Apktool لفك وتجميع التطبيقات
RUN wget https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool -O /usr/local/bin/apktool && \
    chmod +x /usr/local/bin/apktool && \
    wget https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.9.3.jar -O /usr/local/bin/apktool.jar && \
    chmod +x /usr/local/bin/apktool.jar

# تحديد مجلد العمل
WORKDIR /usr/src/app

# نسخ الملفات وتسطيب المكتبات
COPY package*.json ./
RUN npm install
COPY . .

# عمل مجلد الرفع
RUN mkdir -p uploads

# تشغيل السيرفر
EXPOSE 3000
CMD ["npm", "start"]

