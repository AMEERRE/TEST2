// Language and Content Management System
class PersonalWebsite {
    constructor() {
        this.currentLang = 'ar';
        this.isEditMode = false;
        this.content = this.getDefaultContent();
        this.skills = [];
        this.experiences = [];
        this.blogPosts = [];
        this.db = null;
        this.initDatabase().then(() => {
            this.init();
        }).catch(error => {
            console.error("خطأ في تهيئة قاعدة البيانات:", error);
            this.init();
        });
    }

    // تهيئة قاعدة البيانات
    async initDatabase() {
        this.db = new WebsiteDatabase();
        try {
            await this.db.initDB();
            console.log('تم تهيئة قاعدة البيانات بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في تهيئة قاعدة البيانات:', error);
            return false;
        }
    }

    async init() {
        await this.loadContent();
        await this.loadSkills();
        await this.loadExperiences();
        await this.loadBlogPosts();
        await this.loadProfileImage();
        
        // استعادة إعداد الوضع الداكن
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        this.setupEventListeners();
        this.updateLanguage();
        this.loadDynamicContent();
        
        // استعادة حالة وضع التحرير
        this.restoreEditMode();
    }

    // استعادة حالة وضع التحرير
    async restoreEditMode() {
        try {
            // التحقق مما إذا كانت حالة وضع التحرير محفوظة
            if (this.content[this.currentLang].customFields && 
                this.content[this.currentLang].customFields['editMode'] === true) {
                // تفعيل وضع التحرير
                this.isEditMode = false; // نضبطها على false لأن toggleEditMode سيعكسها
                this.toggleEditMode();
            }
        } catch (error) {
            console.error('Error restoring edit mode:', error);
        }
    }

    // تحديث لغة الموقع
    updateLanguage() {
        // تحديث اتجاه الصفحة
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        
        // تحديث المحتوى
        this.updateDynamicText();
    }

    // تحميل المحتوى الديناميكي
    loadDynamicContent() {
        // تحميل المحتوى الديناميكي
        this.updateDynamicText();
    }

    // تحديث النصوص الديناميكية
    updateDynamicText() {
        const currentContent = this.content[this.currentLang];
        
        const elements = {
            'site-title': currentContent.siteTitle,
            'welcome-title': currentContent.welcomeTitle,
            'welcome-subtitle': currentContent.welcomeSubtitle,
            'about-description': currentContent.aboutDescription,
            'contact-email': currentContent.contactEmail
        };

        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });

        // تحميل البيانات المخصصة
        if (currentContent.customFields) {
            Object.entries(currentContent.customFields).forEach(([id, text]) => {
                const elements = document.querySelectorAll(`#${id}, .${id}`);
                elements.forEach(element => {
                    if (element) element.textContent = text;
                });
            });
        }
    }

    // الحصول على المحتوى الافتراضي
    getDefaultContent() {
        return {
            ar: {
                siteTitle: "إبداع تقني بلمسة احترافية",
                welcomeTitle: "مرحباً بك في موقعي الشخصي",
                welcomeSubtitle: "أنا م.امير احمد، مطور ومصمم شغوف بالتكنولوجيا والإبداع",
                aboutDescription: "اكتب هنا نبذة عن نفسك، خلفيتك، واهتماماتك. يمكنك الحديث عن تعليمك، خبراتك، وما يميزك. هذا النص يمكن تعديله من لوحة التحكم.",
                contactEmail: "sawed.2001.k@gmail.com"
            },
            en: {
                siteTitle: "Technical Creativity with a Professional Touch",
                welcomeTitle: "Welcome to My Personal Website",
                welcomeSubtitle: "I'm Eng. Ameer Ahmed, a developer passionate about technology and creativity",
                aboutDescription: "Write here about yourself, your background, and interests. You can talk about your education, experience, and what makes you unique. This text can be edited from the admin panel.",
                contactEmail: "sawed.2001.k@gmail.com"
            }
        };
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // تبديل اللغة
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }

        // تبديل وضع التحرير
        const adminToggle = document.getElementById('admin-toggle');
        if (adminToggle) {
            adminToggle.addEventListener('click', () => {
                this.toggleEditMode();
            });
        }

        // تبديل الوضع الداكن
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        // تعديل الصورة الشخصية
        const editImageBtn = document.querySelector('.edit-btn[data-edit="profile-image"]');
        if (editImageBtn) {
            editImageBtn.addEventListener('click', () => {
                this.editProfileImage();
            });
        }

        // إرسال منشور جديد
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                this.handlePostSubmit(e);
            });
        }

        // إعداد أزرار اقرأ المزيد الموجودة
        this.setupReadMoreButtons();

        // إغلاق النوافذ المنبثقة
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // إغلاق النافذة عند النقر خارجها
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // نموذج الاتصال
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                this.handleContactForm(e);
            });
        }

        // التمرير السلس للتنقل
        document.querySelectorAll('a[href^="#"]:not(.read-more)').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // تبديل القائمة المتنقلة
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // إضافة أزرار التنقل بين المنشورات
        const prevBtn = document.getElementById('prev-post');
        const nextBtn = document.getElementById('next-post');
        const blogContainer = document.getElementById('blog-container');
        
        if (prevBtn && nextBtn && blogContainer) {
            prevBtn.addEventListener('click', () => {
                blogContainer.scrollBy({ left: 370, behavior: 'smooth' });
            });
            
            nextBtn.addEventListener('click', () => {
                blogContainer.scrollBy({ left: -370, behavior: 'smooth' });
            });
        }
    }

    // إعداد أزرار اقرأ المزيد
    setupReadMoreButtons() {
        document.querySelectorAll('.read-more').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleReadMore(e.target);
            });
        });
    }

    // معالجة زر اقرأ المزيد
    handleReadMore(button) {
        const blogPost = button.closest('.blog-post');
        const content = blogPost.querySelector('p');
        
        if (content.classList.contains('expanded')) {
            // إخفاء المحتوى الكامل
            content.classList.remove('expanded');
            button.textContent = this.currentLang === 'ar' ? 'اقرأ المزيد' : 'Read more';
        } else {
            // إظهار المحتوى الكامل
            content.classList.add('expanded');
            button.textContent = this.currentLang === 'ar' ? 'إخفاء' : 'Show less';
        }
    }

    // إضافة مهارة جديدة
    async addSkill() {
        const skillName = prompt(this.currentLang === 'ar' ? 'اسم المهارة:' : 'Skill name:');
        const skillIcon = prompt(this.currentLang === 'ar' ? 'أيقونة المهارة (مثل: fab fa-react):' : 'Skill icon (e.g., fab fa-react):');
        
        if (skillName && skillIcon) {
            const skillsContainer = document.getElementById('skills-container');
            if (skillsContainer) {
                const skillItem = document.createElement('div');
                skillItem.className = 'skill-item';
                skillItem.innerHTML = `
                    <i class="${skillIcon}"></i>
                    <span>${skillName}</span>
                    <button class="remove-skill" onclick="this.parentElement.remove(); window.website.saveSkills();">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                skillsContainer.appendChild(skillItem);
                
                // حفظ المهارات في قاعدة البيانات
                await this.saveSkills();
                
                this.showNotification(this.currentLang === 'ar' ? 'تم إضافة المهارة بنجاح!' : 'Skill added successfully!');
            }
        }
    }

    // إضافة خبرة جديدة
    async addExperience() {
        const title = prompt(this.currentLang === 'ar' ? 'المسمى الوظيفي:' : 'Job title:');
        const company = prompt(this.currentLang === 'ar' ? 'اسم الشركة:' : 'Company name:');
        const period = prompt(this.currentLang === 'ar' ? 'الفترة الزمنية:' : 'Time period:');
        const description = prompt(this.currentLang === 'ar' ? 'وصف الوظيفة:' : 'Job description:');
        
        if (title && company && period && description) {
            const timelineContainer = document.getElementById('timeline-container');
            if (timelineContainer) {
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                timelineItem.innerHTML = `
                    <div class="timeline-date">${period}</div>
                    <div class="timeline-content">
                        <h3 class="editable">${title}</h3>
                        <h4 class="editable">${company}</h4>
                        <p class="editable">${description}</p>
                        <button class="remove-experience" onclick="this.parentElement.parentElement.remove(); window.website.saveExperiences();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                timelineContainer.appendChild(timelineItem);
                
                // حفظ الخبرات في قاعدة البيانات
                await this.saveExperiences();
                
                this.showNotification(this.currentLang === 'ar' ? 'تم إضافة الخبرة بنجاح!' : 'Experience added successfully!');
            }
        }
    }

    // فتح نافذة إضافة منشور
    openPostModal() {
        const modal = document.getElementById('post-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // معالجة إرسال منشور جديد
    async handlePostSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        
        if (title && content) {
            const blogContainer = document.getElementById('blog-container');
            if (blogContainer) {
                const currentDate = new Date().toLocaleDateString(this.currentLang === 'ar' ? 'ar-SA' : 'en-US');
                
                const blogPost = document.createElement('article');
                blogPost.className = 'blog-post';
                blogPost.innerHTML = `
                    <div class="post-date">${currentDate}</div>
                    <h3 class="editable">${title}</h3>
                    <p class="editable">${content}</p>
                    <button class="remove-post" onclick="this.parentElement.remove(); window.website.saveBlogPosts();">
                        <i class="fas fa-trash"></i>
                    </button>
                    <a href="#" class="read-more">${this.currentLang === 'ar' ? 'اقرأ المزيد' : 'Read more'}</a>
                `;
                
                blogContainer.appendChild(blogPost);
                
                // إضافة event listener للزر الجديد
                const newReadMoreBtn = blogPost.querySelector('.read-more');
                if (newReadMoreBtn) {
                    newReadMoreBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleReadMore(e.target);
                    });
                }
                
                // حفظ المنشورات في قاعدة البيانات
                await this.saveBlogPosts();
                
                // إغلاق النافذة وإعادة تعيين النموذج
                const modal = document.getElementById('post-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                e.target.reset();
                
                this.showNotification(this.currentLang === 'ar' ? 'تم نشر المقال بنجاح!' : 'Post published successfully!');
            }
        }
    }

    // تعديل الصورة الشخصية
    async editProfileImage() {
        // إنشاء input file مخفي
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        // إضافة event listener لمعالجة اختيار الملف
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // التحقق من نوع الملف
                if (!file.type.startsWith('image/')) {
                    this.showNotification(this.currentLang === 'ar' ? 'يرجى اختيار ملف صورة صالح!' : 'Please select a valid image file!');
                    return;
                }
                
                // التحقق من حجم الملف (أقل من 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    this.showNotification(this.currentLang === 'ar' ? 'حجم الصورة كبير جداً! يرجى اختيار صورة أصغر من 5MB' : 'Image size is too large! Please select an image smaller than 5MB');
                    return;
                }
                
                // قراءة الملف وتحويله إلى base64
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const profileImage = document.getElementById('profile-image');
                    if (profileImage) {
                        profileImage.src = event.target.result;
                        
                        // حفظ الصورة في قاعدة البيانات
                        try {
                            await this.db.saveProfileImage(event.target.result);
                        } catch (error) {
                            console.log('Error saving image:', error);
                        }
                        
                        this.showNotification(this.currentLang === 'ar' ? 'تم تحديث الصورة بنجاح!' : 'Image updated successfully!');
                    }
                };
                
                reader.onerror = () => {
                    this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في قراءة الملف!' : 'Error reading file!');
                };
                
                reader.readAsDataURL(file);
            }
            
            // إزالة input من DOM
            if (document.body.contains(fileInput)) {
                document.body.removeChild(fileInput);
            }
        });
        
        // إضافة input إلى DOM وتشغيل النقر
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    // تحميل الصورة المحفوظة
    async loadProfileImage() {
        try {
            const savedImage = await this.db.getProfileImage();
            if (savedImage) {
                const profileImage = document.getElementById('profile-image');
                if (profileImage) {
                    profileImage.src = savedImage;
                }
            }
        } catch (error) {
            console.error('Error loading profile image:', error);
        }
    }

    // تحميل المحتوى
    async loadContent() {
        try {
            const savedContent = await this.db.getContent();
            if (savedContent) {
                this.content = savedContent;
            }
        } catch (error) {
            console.error('Error loading content:', error);
            // استخدام المحتوى الافتراضي إذا فشل التحميل
            this.content = this.getDefaultContent();
        }
    }

    // حفظ المحتوى
    async saveContent() {
        try {
            await this.db.saveContent(this.content);
        } catch (error) {
            console.error('Error saving content:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ المحتوى!' : 'Error saving content!');
        }
    }

    // تحميل المهارات
    async loadSkills() {
        try {
            const skills = await this.db.getSkills();
            if (skills && skills.length > 0) {
                const skillsContainer = document.getElementById('skills-container');
                if (skillsContainer) {
                    // مسح المهارات الحالية
                    skillsContainer.innerHTML = '';
                    
                    // إضافة المهارات المحفوظة
                    skills.forEach(skill => {
                        const skillItem = document.createElement('div');
                        skillItem.className = 'skill-item';
                        skillItem.innerHTML = `
                            <i class="${skill.icon}"></i>
                            <span>${skill.name}</span>
                            ${this.isEditMode ? `
                            <button class="remove-skill" onclick="this.parentElement.remove(); window.website.saveSkills();">
                                <i class="fas fa-times"></i>
                            </button>` : ''}
                        `;
                        skillsContainer.appendChild(skillItem);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading skills:', error);
        }
    }

    // حفظ المهارات
    async saveSkills() {
        try {
            const skillsContainer = document.getElementById('skills-container');
            if (skillsContainer) {
                const skills = [];
                skillsContainer.querySelectorAll('.skill-item').forEach(item => {
                    const icon = item.querySelector('i').className;
                    const name = item.querySelector('span').textContent;
                    skills.push({ icon, name });
                });
                
                await this.db.saveSkills(skills);
            }
        } catch (error) {
            console.error('Error saving skills:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ المهارات!' : 'Error saving skills!');
        }
    }

    // تحميل الخبرات
    async loadExperiences() {
        try {
            const experiences = await this.db.getExperiences();
            if (experiences && experiences.length > 0) {
                const timelineContainer = document.getElementById('timeline-container');
                if (timelineContainer) {
                    // مسح الخبرات الحالية
                    timelineContainer.innerHTML = '';
                    
                    // إضافة الخبرات المحفوظة
                    experiences.forEach(exp => {
                        const timelineItem = document.createElement('div');
                        timelineItem.className = 'timeline-item';
                        timelineItem.innerHTML = `
                            <div class="timeline-date">${exp.period}</div>
                            <div class="timeline-content">
                                <h3 class="editable">${exp.title}</h3>
                                <h4 class="editable">${exp.company}</h4>
                                <p class="editable">${exp.description}</p>
                                ${this.isEditMode ? `
                                <button class="remove-experience" onclick="this.parentElement.parentElement.remove(); window.website.saveExperiences();">
                                    <i class="fas fa-trash"></i>
                                </button>` : ''}
                            </div>
                        `;
                        timelineContainer.appendChild(timelineItem);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading experiences:', error);
        }
    }

    // حفظ الخبرات
    async saveExperiences() {
        try {
            const timelineContainer = document.getElementById('timeline-container');
            if (timelineContainer) {
                const experiences = [];
                timelineContainer.querySelectorAll('.timeline-item').forEach(item => {
                    const period = item.querySelector('.timeline-date')?.textContent || '';
                    const title = item.querySelector('h3')?.textContent || '';
                    const company = item.querySelector('h4')?.textContent || '';
                    const description = item.querySelector('p')?.textContent || '';
                    experiences.push({ period, title, company, description });
                });
                
                await this.db.saveExperiences(experiences);
            }
        } catch (error) {
            console.error('Error saving experiences:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ الخبرات!' : 'Error saving experiences!');
        }
    }

    // تحميل المنشورات
    async loadBlogPosts() {
        try {
            const posts = await this.db.getBlogPosts();
            if (posts && posts.length > 0) {
                const blogContainer = document.getElementById('blog-container');
                if (blogContainer) {
                    // مسح المنشورات الحالية
                    blogContainer.innerHTML = '';
                    
                    // إضافة المنشورات المحفوظة
                    posts.forEach(post => {
                        const blogPost = document.createElement('article');
                        blogPost.className = 'blog-post';
                        blogPost.innerHTML = `
                            <div class="post-date">${post.date}</div>
                            <h3 class="editable">${post.title}</h3>
                            <p class="editable">${post.content}</p>
                            ${this.isEditMode ? `
                            <button class="remove-post" onclick="this.parentElement.remove(); window.website.saveBlogPosts();">
                                <i class="fas fa-trash"></i>
                            </button>` : ''}
                            <a href="#" class="read-more">${this.currentLang === 'ar' ? 'اقرأ المزيد' : 'Read more'}</a>
                        `;
                        blogContainer.appendChild(blogPost);
                    });
                    
                    // إضافة event listeners لأزرار اقرأ المزيد
                    this.setupReadMoreButtons();
                }
            }
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    }

    // حفظ المنشورات
    async saveBlogPosts() {
        try {
            const blogContainer = document.getElementById('blog-container');
            if (blogContainer) {
                const posts = [];
                blogContainer.querySelectorAll('.blog-post').forEach(post => {
                    const date = post.querySelector('.post-date')?.textContent || new Date().toLocaleDateString();
                    const title = post.querySelector('h3')?.textContent || '';
                    const content = post.querySelector('p')?.textContent || '';
                    posts.push({ date, title, content });
                });
                
                await this.db.saveBlogPosts(posts);
            }
        } catch (error) {
            console.error('Error saving blog posts:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ المنشورات!' : 'Error saving blog posts!');
        }
    }

    // تبديل اللغة
    toggleLanguage() {
        this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
        document.getElementById('current-lang').textContent = this.currentLang.toUpperCase();
        this.updateLanguage();
    }

    // تبديل وضع التحرير
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.body.classList.toggle('edit-mode', this.isEditMode);
        
        // إظهار/إخفاء أزرار التحرير
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.style.display = this.isEditMode ? 'flex' : 'none';
        });
        
        // إضافة/إزالة الفئة editable للعناصر القابلة للتحرير
        document.querySelectorAll('.editable').forEach(element => {
            element.contentEditable = this.isEditMode;
            element.classList.toggle('editable-active', this.isEditMode);
            
            if (this.isEditMode) {
                element.addEventListener('blur', () => this.saveContent());
            } else {
                element.removeEventListener('blur', () => this.saveContent());
            }
        });
        
        // إظهار/إخفاء أزرار الإضافة
        const addButtons = document.querySelectorAll('.add-skill-btn, .add-experience-btn, .add-post-btn');
        addButtons.forEach(btn => {
            btn.style.display = this.isEditMode ? 'flex' : 'none';
        });
        
        // حفظ حالة وضع التحرير
        if (!this.content[this.currentLang].customFields) {
            this.content[this.currentLang].customFields = {};
        }
        this.content[this.currentLang].customFields['editMode'] = this.isEditMode;
        this.saveContent();
        
        // إعادة تحميل المحتوى لتحديث أزرار الحذف
        this.loadSkills();
        this.loadExperiences();
        this.loadBlogPosts();
        
        this.showNotification(this.isEditMode ? 
            (this.currentLang === 'ar' ? 'تم تفعيل وضع التحرير' : 'Edit mode enabled') : 
            (this.currentLang === 'ar' ? 'تم إلغاء وضع التحرير' : 'Edit mode disabled'));
    }

    // تبديل القائمة المتنقلة
    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        if (navMenu && hamburger) {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        }
    }

    // معالجة نموذج الاتصال
    handleContactForm(e) {
        e.preventDefault();
        const form = e.target;
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const message = form.querySelector('textarea').value;
        
        if (name && email && message) {
            // هنا يمكن إضافة كود لإرسال الرسالة عبر API أو خدمة بريد إلكتروني
            console.log('Contact form submitted:', { name, email, message });
            
            // إعادة تعيين النموذج
            form.reset();
            
            this.showNotification(this.currentLang === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
        } else {
            this.showNotification(this.currentLang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة!' : 'Please fill in all required fields!');
        }
    }

    // عرض إشعار
    showNotification(message) {
        // التحقق من وجود عنصر الإشعار
        let notification = document.getElementById('notification');
        
        // إنشاء عنصر الإشعار إذا لم يكن موجوداً
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // تعيين الرسالة وإظهار الإشعار
        notification.textContent = message;
        notification.classList.add('show');
        
        // إخفاء الإشعار بعد 3 ثوانٍ
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // تبديل الوضع الداكن
    toggleDarkMode() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        this.showNotification(this.currentLang === 'ar' ? 
            (currentTheme === 'dark' ? 'تم تفعيل الوضع الفاتح' : 'تم تفعيل الوضع الداكن') : 
            (currentTheme === 'dark' ? 'Light mode enabled' : 'Dark mode enabled'));
    }
}

// إنشاء كائن الموقع وتعيينه كمتغير عام
window.addEventListener('DOMContentLoaded', () => {
    window.website = new PersonalWebsite();
});