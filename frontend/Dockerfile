FROM nginx:1.29-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/index.html /usr/share/nginx/html/index.html
COPY frontend/create.html /usr/share/nginx/html/create.html
COPY frontend/project.html /usr/share/nginx/html/project.html
COPY frontend/projects.js /usr/share/nginx/html/projects.js
COPY frontend/create-project.js /usr/share/nginx/html/create-project.js
COPY frontend/project-details.js /usr/share/nginx/html/project-details.js
COPY frontend/styles.css /usr/share/nginx/html/styles.css
