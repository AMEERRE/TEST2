/**
 * Personal Website - Main JavaScript
 * يدير المحتوى والتفاعلات والتخزين المحلي للموقع الشخصي
 */

class PersonalWebsite {
    constructor() {
        // الإعدادات الأساسية
        this.currentLang = 'ar';
        this.isEditMode = false;
        this.content = this.getDefaultContent();
        this.skills = [];
        this.experiences = [];
        this.blogPosts = [];
        this.db = null;
        
        // تهيئة قاعدة البيانات والموقع
        this.initDatabase()
            .then(() => this.init())
            .catch(error => {
                console.error("خطأ في تهيئة قاعدة البيانات:", error);
                this.init();
            });
    }

    /**
     * تهيئة قاعدة البيانات
     * @returns {Promise<boolean>} حالة نجاح التهيئة
     */
    async initDatabase() {
        try {
            this.db = new WebsiteDatabase();
            await this.db.initDB();
            console.log('تم تهيئة قاعدة البيانات بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في تهيئة قاعدة البيانات:', error);
            return false;
        }
    }

    /**
     * تهيئة الموقع وتحميل البيانات
     */
    async init() {
        try {
            // تحميل البيانات من قاعدة البيانات
            await Promise.all([
                this.loadContent(),
                this.loadSkills(),
                this.loadExperiences(),
                this.loadBlogPosts(),
                this.loadProfileImage()
            ]);
            
            // استعادة إعداد الوضع الداكن
            this.restoreTheme();
            
            // إعداد مستمعي الأحداث وتحديث اللغة
            this.setupEventListeners();
            this.updateLanguage();
            this.loadDynamicContent();
            
            // استعادة حالة وضع التحرير
            this.restoreEditMode();
            
            // إضافة التأثيرات المتحركة
            this.setupAnimations();
        } catch (error) {
            console.error('خطأ في تهيئة الموقع:', error);
            this.showNotification(this.currentLang === 'ar' ? 
                'حدث خطأ أثناء تحميل الموقع' : 
                'Error loading the website');
        }
    }

    /**
     * إعداد التأثيرات المتحركة
     */
    setupAnimations() {
        this.setupScrollAnimations();
        this.setupNavbarScroll();
        this.setupBackgroundEffects();
        this.setupButtonEffects();
    }

    /**
     * استعادة إعداد الوضع الداكن
     */
    restoreTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    /**
     * استعادة حالة وضع التحرير
     */
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
            console.error('خطأ في استعادة وضع التحرير:', error);
        }
    }

    /**
     * تحديث لغة الموقع
     */
    updateLanguage() {
        // تحديث اتجاه الصفحة
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        
        // تحديث المحتوى
        this.updateDynamicText();
    }

    /**
     * تحميل المحتوى الديناميكي
     */
    loadDynamicContent() {
        this.updateDynamicText();
    }

    /**
     * تحديث النصوص الديناميكية
     */
    updateDynamicText() {
        try {
            const currentContent = this.content[this.currentLang];
            
            // تعيين النصوص الأساسية
            const elements = {
                'site-title': currentContent.siteTitle,
                'welcome-title': currentContent.welcomeTitle,
                'welcome-subtitle': currentContent.welcomeSubtitle,
                'about-description': currentContent.aboutDescription,
                'contact-email': currentContent.contactEmail
            };

            // تحديث النصوص
            Object.entries(elements).forEach(([id, text]) => {
                const element = document.getElementById(id);
                if (element) element.textContent = text;
            });
            
            // تحديث نصوص الأقسام
            const sections = {
                'about-section': currentContent.sections.about,
                'skills-section': currentContent.sections.skills,
                'experience-section': currentContent.sections.experience,
                'blog-section': currentContent.sections.blog,
                'contact-section': currentContent.sections.contact
            };
            
            // تحديث عناوين الأقسام
            Object.entries(sections).forEach(([id, text]) => {
                const section = document.getElementById(id);
                if (section) {
                    const title = section.querySelector('.section-title');
                    if (title) title.textContent = text;
                }
            });
            
            // تحديث نصوص الأزرار
            const buttons = {
                'contact-btn': currentContent.buttons.contact,
                'download-cv': currentContent.buttons.downloadCV,
                'submit-contact': currentContent.buttons.submitContact
            };
            
            // تحديث نصوص الأزرار
            Object.entries(buttons).forEach(([id, text]) => {
                const button = document.getElementById(id);
                if (button) button.textContent = text;
            });
            
            // تحديث نصوص القائمة
            const menuItems = document.querySelectorAll('.nav-menu a');
            const menuTexts = currentContent.menu;
            
            if (menuItems.length === menuTexts.length) {
                menuItems.forEach((item, index) => {
                    item.textContent = menuTexts[index];
                });
            }
            
            // تحديث نص زر اللغة
            const langBtn = document.getElementById('current-lang');
            if (langBtn) langBtn.textContent = this.currentLang.toUpperCase();
            
            // تحديث نصوص نموذج الاتصال
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                const nameInput = contactForm.querySelector('input[type="text"]');
                const emailInput = contactForm.querySelector('input[type="email"]');
                const messageInput = contactForm.querySelector('textarea');
                
                if (nameInput) nameInput.placeholder = currentContent.contactForm.name;
                if (emailInput) emailInput.placeholder = currentContent.contactForm.email;
                if (messageInput) messageInput.placeholder = currentContent.contactForm.message;
            }
        } catch (error) {
            console.error('خطأ في تحديث النصوص:', error);
        }
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        try {
            // زر تبديل اللغة
            const langToggle = document.getElementById('lang-toggle');
            if (langToggle) {
                langToggle.addEventListener('click', () => {
                    this.toggleLanguage();
                });
            }
            
            // زر تبديل الوضع الداكن
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => {
                    this.toggleDarkMode();
                });
            }
            
            // زر وضع التحرير
            const adminBtn = document.getElementById('admin-btn');
            if (adminBtn) {
                adminBtn.addEventListener('click', () => {
                    this.toggleEditMode();
                });
            }
            
            // زر تحرير الصورة الشخصية
            const editProfileBtn = document.getElementById('edit-profile');
            if (editProfileBtn) {
                editProfileBtn.addEventListener('click', () => {
                    this.editProfileImage();
                });
            }
            
            // زر إضافة مهارة
            const addSkillBtn = document.querySelector('.add-skill-btn');
            if (addSkillBtn) {
                addSkillBtn.addEventListener('click', () => {
                    this.addSkill();
                });
            }
            
            // زر إضافة خبرة
            const addExperienceBtn = document.querySelector('.add-experience-btn');
            if (addExperienceBtn) {
                addExperienceBtn.addEventListener('click', () => {
                    this.addExperience();
                });
            }
            
            // زر إضافة منشور
            const addPostBtn = document.querySelector('.add-post-btn');
            if (addPostBtn) {
                addPostBtn.addEventListener('click', () => {
                    this.openPostModal();
                });
            }
            
            // نموذج إضافة منشور
            const postForm = document.getElementById('post-form');
            if (postForm) {
                postForm.addEventListener('submit', (e) => {
                    this.handlePostSubmit(e);
                });
            }
            
            // أزرار إغلاق النوافذ المنبثقة
            const closeButtons = document.querySelectorAll('.close-modal');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const modal = button.closest('.modal');
                    if (modal) modal.style.display = 'none';
                });
            });
            
            // نموذج الاتصال
            const contactForm = document.getElementById('contact-form');
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
                    blogContainer.scrollBy({ left: -370, behavior: 'smooth' });
                });
                
                nextBtn.addEventListener('click', () => {
                    blogContainer.scrollBy({ left: 370, behavior: 'smooth' });
                });
            }
            
            // إعداد أزرار اقرأ المزيد
            this.setupReadMoreButtons();
        } catch (error) {
            console.error('خطأ في إعداد مستمعي الأحداث:', error);
        }
    }

    /**
     * إعداد أزرار اقرأ المزيد
     */
    setupReadMoreButtons() {
        try {
            document.querySelectorAll('.read-more').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleReadMore(e.target);
                });
            });
        } catch (error) {
            console.error('خطأ في إعداد أزرار اقرأ المزيد:', error);
        }
    }

    /**
     * معالجة زر اقرأ المزيد
     * @param {HTMLElement} button زر اقرأ المزيد
     */
    handleReadMore(button) {
        try {
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
        } catch (error) {
            console.error('خطأ في معالجة زر اقرأ المزيد:', error);
        }
    }

    /**
     * إضافة مهارة جديدة
     */
    async addSkill() {
        try {
            const skillName = prompt(this.currentLang === 'ar' ? 'اسم المهارة:' : 'Skill name:');
            const skillIcon = prompt(this.currentLang === 'ar' ? 'أيقونة المهارة (مثل: fab fa-react):' : 'Skill icon (e.g., fab fa-react):');
            
            if (!skillName || !skillIcon) return;
            
            const skillsContainer = document.getElementById('skills-container');
            if (!skillsContainer) return;
            
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
        } catch (error) {
            console.error('خطأ في إضافة مهارة:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ أثناء إضافة المهارة' : 'Error adding skill');
        }
    }

    /**
     * إضافة خبرة جديدة
     */
    async addExperience() {
        try {
            const title = prompt(this.currentLang === 'ar' ? 'المسمى الوظيفي:' : 'Job title:');
            const company = prompt(this.currentLang === 'ar' ? 'اسم الشركة:' : 'Company name:');
            const period = prompt(this.currentLang === 'ar' ? 'الفترة الزمنية:' : 'Time period:');
            const description = prompt(this.currentLang === 'ar' ? 'وصف الوظيفة:' : 'Job description:');
            
            if (!title || !company || !period || !description) return;
            
            const timelineContainer = document.getElementById('timeline-container');
            if (!timelineContainer) return;
            
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
        } catch (error) {
            console.error('خطأ في إضافة خبرة:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ أثناء إضافة الخبرة' : 'Error adding experience');
        }
    }

    /**
     * فتح نافذة إضافة منشور
     */
    openPostModal() {
        try {
            const modal = document.getElementById('post-modal');
            if (modal) {
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('خطأ في فتح نافذة المنشور:', error);
        }
    }

    /**
     * معالجة إرسال منشور جديد
     * @param {Event} e حدث النموذج
     */
    async handlePostSubmit(e) {
        try {
            e.preventDefault();
            
            const title = document.getElementById('post-title')?.value;
            const content = document.getElementById('post-content')?.value;
            
            if (!title || !content) return;
            
            const blogContainer = document.getElementById('blog-container');
            if (!blogContainer) return;
            
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
        } catch (error) {
            console.error('خطأ في إرسال المنشور:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ أثناء نشر المقال' : 'Error publishing post');
        }
    }

    /**
     * تعديل الصورة الشخصية
     */
    async editProfileImage() {
        try {
            // إنشاء input file مخفي
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            
            // إضافة event listener لمعالجة اختيار الملف
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
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
                            this.showNotification(this.currentLang === 'ar' ? 'تم تحديث الصورة بنجاح!' : 'Image updated successfully!');
                        } catch (error) {
                            console.error('خطأ في حفظ الصورة:', error);
                            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ الصورة' : 'Error saving image');
                        }
                    }
                };
                
                reader.onerror = () => {
                    this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في قراءة الملف!' : 'Error reading file!');
                };
                
                reader.readAsDataURL(file);
                
                // إزالة input من DOM
                if (document.body.contains(fileInput)) {
                    document.body.removeChild(fileInput);
                }
            });
            
            // إضافة input إلى DOM وتشغيل النقر
            document.body.appendChild(fileInput);
            fileInput.click();
        } catch (error) {
            console.error('خطأ في تعديل الصورة الشخصية:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ أثناء تعديل الصورة' : 'Error editing profile image');
        }
    }

    /**
     * تحميل الصورة المحفوظة
     */
    loadProfileImage() {
        return new Promise(async (resolve) => {
            try {
                const profileImage = document.getElementById('profile-image');
                if (profileImage) {
                    // إضافة خاصية loading="lazy" لتحسين الأداء
                    profileImage.loading = 'lazy';
                    
                    // محاولة تحميل الصورة من قاعدة البيانات
                    const imageData = await this.db.getProfileImage();
                    if (imageData) {
                        profileImage.src = imageData;
                    }
                }
                resolve(true);
            } catch (error) {
                console.error('خطأ في تحميل الصورة الشخصية:', error);
                resolve(false);
            }
        });
    }

    /**
     * تحميل المحتوى
     */
    async loadContent() {
        try {
            const savedContent = await this.db.getContent();
            if (savedContent) {
                this.content = savedContent;
            }
        } catch (error) {
            console.error('خطأ في تحميل المحتوى:', error);
            // استخدام المحتوى الافتراضي إذا فشل التحميل
            this.content = this.getDefaultContent();
        }
    }

    /**
     * حفظ المحتوى
     */
    async saveContent() {
        try {
            await this.db.saveContent(this.content);
        } catch (error) {
            console.error('خطأ في حفظ المحتوى:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ المحتوى!' : 'Error saving content!');
        }
    }

    /**
     * تحميل المهارات
     */
    async loadSkills() {
        try {
            const skills = await this.db.getSkills();
            if (!skills || skills.length === 0) return;
            
            const skillsContainer = document.getElementById('skills-container');
            if (!skillsContainer) return;
            
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
        } catch (error) {
            console.error('خطأ في تحميل المهارات:', error);
        }
    }

    /**
     * حفظ المهارات
     */
    async saveSkills() {
        try {
            const skillsContainer = document.getElementById('skills-container');
            if (!skillsContainer) return;
            
            const skills = [];
            skillsContainer.querySelectorAll('.skill-item').forEach(item => {
                const icon = item.querySelector('i')?.className || '';
                const name = item.querySelector('span')?.textContent || '';
                if (icon && name) {
                    skills.push({ icon, name });
                }
            });
            
            await this.db.saveSkills(skills);
        } catch (error) {
            console.error('خطأ في حفظ المهارات:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ المهارات!' : 'Error saving skills!');
        }
    }

    /**
     * تحميل الخبرات
     */
    async loadExperiences() {
        try {
            const experiences = await this.db.getExperiences();
            if (!experiences || experiences.length === 0) return;
            
            const timelineContainer = document.getElementById('timeline-container');
            if (!timelineContainer) return;
            
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
        } catch (error) {
            console.error('خطأ في تحميل الخبرات:', error);
        }
    }

    /**
     * حفظ الخبرات
     */
    async saveExperiences() {
        try {
            const timelineContainer = document.getElementById('timeline-container');
            if (!timelineContainer) return;
            
            const experiences = [];
            timelineContainer.querySelectorAll('.timeline-item').forEach(item => {
                const period = item.querySelector('.timeline-date')?.textContent || '';
                const title = item.querySelector('h3')?.textContent || '';
                const company = item.querySelector('h4')?.textContent || '';
                const description = item.querySelector('p')?.textContent || '';
                
                if (period && title && company) {
                    experiences.push({ period, title, company, description });
                }
            });
            
            await this.db.saveExperiences(experiences);
        } catch (error) {
            console.error('خطأ في حفظ الخبرات:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ الخبرات!' : 'Error saving experiences!');
        }
    }

    /**
     * تحميل المنشورات
     */
    async loadBlogPosts() {
        try {
            const posts = await this.db.getBlogPosts();
            if (!posts || posts.length === 0) return;
            
            const blogContainer = document.getElementById('blog-container');
            if (!blogContainer) return;
            
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
        } catch (error) {
            console.error('خطأ في تحميل المنشورات:', error);
        }
    }

    /**
     * حفظ المنشورات
     */
    async saveBlogPosts() {
        try {
            const blogContainer = document.getElementById('blog-container');
            if (!blogContainer) return;
            
            const posts = [];
            blogContainer.querySelectorAll('.blog-post').forEach(post => {
                const date = post.querySelector('.post-date')?.textContent || new Date().toLocaleDateString();
                const title = post.querySelector('h3')?.textContent || '';
                const content = post.querySelector('p')?.textContent || '';
                
                if (title && content) {
                    posts.push({ date, title, content });
                }
            });
            
            await this.db.saveBlogPosts(posts);
        } catch (error) {
            console.error('خطأ في حفظ المنشورات:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في حفظ المنشورات!' : 'Error saving blog posts!');
        }
    }

    /**
     * تبديل اللغة
     */
    toggleLanguage() {
        try {
            this.currentLang = this.currentLang === 'ar' ? 'en' : 'ar';
            const langBtn = document.getElementById('current-lang');
            if (langBtn) langBtn.textContent = this.currentLang.toUpperCase();
            this.updateLanguage();
            
            // تحديث أزرار اقرأ المزيد
            document.querySelectorAll('.read-more').forEach(button => {
                const content = button.closest('.blog-post').querySelector('p');
                if (content.classList.contains('expanded')) {
                    button.textContent = this.currentLang === 'ar' ? 'إخفاء' : 'Show less';
                } else {
                    button.textContent = this.currentLang === 'ar' ? 'اقرأ المزيد' : 'Read more';
                }
            });
        } catch (error) {
            console.error('خطأ في تبديل اللغة:', error);
        }
    }

    /**
     * تبديل وضع التحرير
     */
    toggleEditMode() {
        try {
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
        } catch (error) {
            console.error('خطأ في تبديل وضع التحرير:', error);
        }
    }

    /**
     * تبديل القائمة المتنقلة
     */
    toggleMobileMenu() {
        try {
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            if (navMenu && hamburger) {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            }
        } catch (error) {
            console.error('خطأ في تبديل القائمة المتنقلة:', error);
        }
    }

    /**
     * معالجة نموذج الاتصال
     * @param {Event} e حدث النموذج
     */
    handleContactForm(e) {
        try {
            e.preventDefault();
            const form = e.target;
            
            // التحقق من صحة النموذج
            if (!this.validateContactForm(form)) {
                return;
            }
            
            const name = form.querySelector('input[type="text"]')?.value;
            const email = form.querySelector('input[type="email"]')?.value;
            const message = form.querySelector('textarea')?.value;
            
            // هنا يمكن إضافة كود لإرسال الرسالة عبر API أو خدمة بريد إلكتروني
            console.log('Contact form submitted:', { name, email, message });
            
            // إعادة تعيين النموذج
            form.reset();
            
            this.showNotification(this.currentLang === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
        } catch (error) {
            console.error('خطأ في معالجة نموذج الاتصال:', error);
            this.showNotification(this.currentLang === 'ar' ? 'حدث خطأ في إرسال الرسالة' : 'Error sending message');
        }
    }

    /**
     * التحقق من صحة نموذج الاتصال
     */
    validateContactForm(form) {
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const messageInput = form.querySelector('textarea');
        let isValid = true;
        
        // التحقق من الاسم
        if (!nameInput.value.trim()) {
            this.showInputError(nameInput, this.currentLang === 'ar' ? 'يرجى إدخال الاسم' : 'Please enter your name');
            isValid = false;
        } else {
            this.clearInputError(nameInput);
        }
        
        // التحقق من البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
            this.showInputError(emailInput, this.currentLang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
            isValid = false;
        } else {
            this.clearInputError(emailInput);
        }
        
        // التحقق من الرسالة
        if (!messageInput.value.trim()) {
            this.showInputError(messageInput, this.currentLang === 'ar' ? 'يرجى إدخال رسالتك' : 'Please enter your message');
            isValid = false;
        } else {
            this.clearInputError(messageInput);
        }
        
        return isValid;
    }

    /**
     * إظهار رسالة خطأ للحقل
     */
    showInputError(input, message) {
        // إزالة أي رسالة خطأ سابقة
        this.clearInputError(input);
        
        // إنشاء عنصر رسالة الخطأ
        const errorElement = document.createElement('div');
        errorElement.className = 'input-error';
        errorElement.textContent = message;
        
        // إضافة الفئة للحقل وإضافة رسالة الخطأ بعده
        input.classList.add('input-error-field');
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }

    /**
     * إزالة رسالة الخطأ من الحقل
     */
    clearInputError(input) {
        input.classList.remove('input-error-field');
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.className === 'input-error') {
            errorElement.parentNode.removeChild(errorElement);
        }
    }

    /**
     * عرض إشعار
     * @param {string} message نص الإشعار
     */
    showNotification(message) {
        try {
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
        } catch (error) {
            console.error('خطأ في عرض الإشعار:', error);
        }
    }

    /**
     * تبديل الوضع الداكن
     */
    toggleDarkMode() {
        try {
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
        } catch (error) {
            console.error('خطأ في تبديل الوضع الداكن:', error);
        }
    }

    /**
     * الحصول على المحتوى الافتراضي
     * @returns {Object} المحتوى الافتراضي
     */
    getDefaultContent() {
        return {
            ar: {
                siteTitle: 'موقعي الشخصي',
                welcomeTitle: 'مرحباً، أنا مطور ويب',
                welcomeSubtitle: 'أقوم بتطوير تطبيقات الويب الحديثة',
                aboutDescription: 'أنا مطور ويب متخصص في تطوير تطبيقات الويب الحديثة باستخدام أحدث التقنيات. أعمل على تطوير واجهات المستخدم وتطبيقات الويب التفاعلية.',
                contactEmail: 'example@example.com',
                sections: {
                    about: 'نبذة عني',
                    skills: 'المهارات',
                    experience: 'الخبرات',
                    blog: 'المدونة',
                    contact: 'اتصل بي'
                },
                buttons: {
                    contact: 'اتصل بي',
                    downloadCV: 'تحميل السيرة الذاتية',
                    submitContact: 'إرسال'
                },
                menu: ['الرئيسية', 'نبذة عني', 'المهارات', 'الخبرات', 'المدونة', 'اتصل بي'],
                contactForm: {
                    name: 'الاسم',
                    email: 'البريد الإلكتروني',
                    message: 'الرسالة'
                },
                customFields: {}
            },
            en: {
                siteTitle: 'My Personal Website',
                welcomeTitle: 'Hello, I am a Web Developer',
                welcomeSubtitle: 'I develop modern web applications',
                aboutDescription: 'I am a web developer specialized in developing modern web applications using the latest technologies. I work on developing user interfaces and interactive web applications.',
                contactEmail: 'example@example.com',
                sections: {
                    about: 'About Me',
                    skills: 'Skills',
                    experience: 'Experience',
                    blog: 'Blog',
                    contact: 'Contact Me'
                },
                buttons: {
                    contact: 'Contact Me',
                    downloadCV: 'Download CV',
                    submitContact: 'Submit'
                },
                menu: ['Home', 'About', 'Skills', 'Experience', 'Blog', 'Contact'],
                contactForm: {
                    name: 'Name',
                    email: 'Email',
                    message: 'Message'
                },
                customFields: {}
            }
        };
    }

    /**
     * إعداد تأثيرات متحركة عند التمرير
     */
    setupScrollAnimations() {
        try {
            const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .timeline-item');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.target.classList.contains('timeline-item')) {
                            entry.target.classList.add('animate');
                        } else {
                            entry.target.classList.add('active');
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });
            
            elements.forEach(element => {
                observer.observe(element);
            });
        } catch (error) {
            console.error('خطأ في إعداد تأثيرات التمرير:', error);
        }
    }

    /**
     * إضافة تأثيرات متحركة للشريط العلوي عند التمرير
     */
    setupNavbarScroll() {
        try {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        } catch (error) {
            console.error('خطأ في إعداد تأثيرات الشريط العلوي:', error);
        }
    }

    /**
     * إضافة تأثيرات متحركة للخلفية
     */
    setupBackgroundEffects() {
        try {
            const sections = document.querySelectorAll('section');
            
            sections.forEach(section => {
                // إضافة عناصر زخرفية متحركة للخلفية
                const decoration = document.createElement('div');
                decoration.classList.add('bg-decoration');
                section.appendChild(decoration);
                
                // إضافة تأثير تتبع المؤشر
                section.addEventListener('mousemove', (e) => {
                    const { left, top, width, height } = section.getBoundingClientRect();
                    const x = (e.clientX - left) / width;
                    const y = (e.clientY - top) / height;
                    
                    decoration.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
                });
            });
        } catch (error) {
            console.error('خطأ في إعداد تأثيرات الخلفية:', error);
        }
    }

    /**
     * تحسين تأثيرات الأزرار
     */
    setupButtonEffects() {
        try {
            const buttons = document.querySelectorAll('.btn, button');
            
            buttons.forEach(button => {
                button.addEventListener('mouseenter', (e) => {
                    const { left, top, width, height } = button.getBoundingClientRect();
                    const x = (e.clientX - left) / width;
                    const y = (e.clientY - top) / height;
                    
                    button.style.setProperty('--x', x);
                    button.style.setProperty('--y', y);
                });
            });
        } catch (error) {
            console.error('خطأ في إعداد تأثيرات الأزرار:', error);
        }
    }
}

// إنشاء كائن الموقع وتعيينه كمتغير عام
window.addEventListener('DOMContentLoaded', () => {
    window.website = new PersonalWebsite();
});