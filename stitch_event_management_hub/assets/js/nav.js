// EventCommand Shell Navigation & Layout Controller

(function () {
    // Check if user is logged in, redirect if not (except on login pages)
    const isLoginPage = window.location.pathname.includes('login_registration');
    const currentUser = window.EC_DB.getCurrentUser();

    if (!currentUser && !isLoginPage) {
        // Find relative path back to login
        const depth = window.location.pathname.split('/').filter(p => p).length;
        let prefix = '../';
        if (window.location.pathname.includes('stitch_event_management_hub')) {
            // Adjust depth relative to stitch_event_management_hub
            const parts = window.location.pathname.split('/');
            const idx = parts.indexOf('stitch_event_management_hub');
            const diff = parts.length - idx - 2;
            prefix = '../'.repeat(Math.max(1, diff)) + 'login_registration/index.html';
        }
        window.location.href = prefix;
        return;
    }

    // Dynamic shell rendering
    window.EC_Nav = {
        renderShell: function (activeTab) {
            this.renderSidebar(activeTab);
            this.renderHeader();
            this.bindEvents();
        },

        renderSidebar: function (activeTab) {
            const container = document.getElementById('sidebar-container');
            if (!container) return;

            const user = window.EC_DB.getCurrentUser() || { name: 'Guest', role: 'user' };
            const isAdmin = user.role === 'admin';

            // Sidebar items definition
            const items = [
                {
                    id: 'dashboard',
                    label: isAdmin ? 'Admin Dashboard' : 'Dashboard',
                    icon: 'dashboard',
                    href: isAdmin ? '../admin_dashboard/index.html' : '../user_dashboard/index.html'
                },
                {
                    id: 'explore',
                    label: 'Explore Events',
                    icon: 'explore',
                    href: '../explore_events/index.html'
                }
            ];

            if (isAdmin) {
                items.push({
                    id: 'manage',
                    label: 'Manage Events',
                    icon: 'edit_calendar',
                    href: '../manage_events/index.html'
                });
            }

            items.push(
                {
                    id: 'calendar',
                    label: 'My Calendar',
                    icon: 'calendar_today',
                    href: '../my_calendar/index.html'
                },
                {
                    id: 'profile',
                    label: 'Profile',
                    icon: 'person',
                    href: '../user_profile/index.html'
                },
                {
                    id: 'nexus',
                    label: 'Nexus AI Insights',
                    icon: 'analytics',
                    href: '../nexus_event_intelligence/index.html'
                }
            );

            // Construct sidebar HTML
            let html = `
                <div class="fixed inset-y-0 left-0 z-40 w-sidebar-width bg-primary-container text-on-primary flex flex-col justify-between border-r border-outline-variant/10 shadow-lg transition-transform duration-300 md:translate-x-0 -translate-x-full" id="sidebar-drawer">
                    <div class="flex flex-col h-full">
                        <!-- Sidebar Brand Header -->
                        <div class="p-stack-lg border-b border-outline-variant/10 flex items-center justify-between">
                            <a href="#" class="flex items-center gap-stack-sm text-on-primary">
                                <span class="material-symbols-outlined text-[32px] text-primary-fixed text-violet-400">event_upcoming</span>
                                <div class="flex flex-col">
                                    <span class="font-headline-sm text-headline-sm font-bold tracking-tight">EventCommand</span>
                                    <span class="text-[10px] uppercase tracking-wider text-on-primary-container opacity-60">Executive Portal</span>
                                </div>
                            </a>
                            <button id="sidebar-close-btn" class="md:hidden text-on-primary hover:text-white">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <!-- Sidebar Nav Items -->
                        <nav class="flex-grow py-stack-lg overflow-y-auto space-y-1">
                            ${items.map(item => {
                                const isActive = item.id === activeTab;
                                return `
                                    <a href="${item.href}" class="flex items-center gap-stack-md px-stack-lg py-3 text-body-md transition-all group ${
                                        isActive 
                                        ? 'bg-primary/40 border-l-4 border-violet-400 text-white font-semibold' 
                                        : 'text-on-primary-container/80 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                                    }">
                                        <span class="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${
                                            isActive ? 'text-violet-400' : 'text-on-primary-container/60'
                                        }">${item.icon}</span>
                                        <span>${item.label}</span>
                                    </a>
                                `;
                            }).join('')}
                        </nav>

                        <!-- Bottom Controls -->
                        <div class="p-stack-lg border-t border-outline-variant/10 space-y-2">
                            <a href="../user_profile/index.html" class="flex items-center gap-stack-md px-3 py-2 rounded text-body-sm text-on-primary-container/80 hover:text-white hover:bg-white/5 transition-all">
                                <span class="material-symbols-outlined text-[20px]">settings</span>
                                <span>Settings</span>
                            </a>
                            <button id="logout-btn" class="w-full flex items-center gap-stack-md px-3 py-2 rounded text-body-sm text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all text-left">
                                <span class="material-symbols-outlined text-[20px]">logout</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Mobile Sidebar Overlay -->
                <div class="fixed inset-0 z-30 bg-black/50 hidden md:hidden" id="sidebar-overlay"></div>
            `;

            container.innerHTML = html;
        },

        renderHeader: function () {
            const container = document.getElementById('header-container');
            if (!container) return;

            const user = window.EC_DB.getCurrentUser() || { name: 'Guest', email: 'guest@company.com', role: 'user' };
            const theme = window.EC_DB.getTheme();

            const avatarUrl = user.role === 'admin'
                ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80' // Professional male admin headshot
                : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80'; // Professional female user headshot

            let html = `
                <header class="h-16 bg-surface-container-lowest border-b border-outline-variant dark:border-neutral-800/40 flex items-center justify-between px-margin-mobile md:px-margin-desktop shadow-sm relative z-20">
                    <!-- Left: Mobile Menu Trigger & Search -->
                    <div class="flex items-center gap-stack-md flex-1">
                        <button id="sidebar-open-btn" class="md:hidden p-1 rounded hover:bg-surface-container text-on-surface">
                            <span class="material-symbols-outlined">menu</span>
                        </button>
                        <div class="relative max-w-md w-full hidden sm:block">
                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                            <input type="text" id="global-search" placeholder="Search events, venues, or topics..." class="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant/60 dark:border-neutral-700/60 rounded-full text-body-sm text-on-surface focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 bg-opacity-40 transition-all"/>
                        </div>
                    </div>

                    <!-- Right: Utilities & User Profile -->
                    <div class="flex items-center gap-stack-lg">
                        <!-- Search Trigger for Mobile -->
                        <button class="sm:hidden text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container">
                            <span class="material-symbols-outlined text-[22px]">search</span>
                        </button>

                        <!-- Theme Toggle Button -->
                        <button id="theme-toggle-btn" class="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container border border-outline-variant/50 dark:border-neutral-700/50 flex items-center justify-center transition-all" title="Toggle Light/Dark Theme">
                            <span class="material-symbols-outlined text-[20px] transition-transform duration-300" id="theme-icon">
                                ${theme === 'dark' ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>

                        <!-- Notification Bell -->
                        <div class="relative">
                            <button class="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container relative">
                                <span class="material-symbols-outlined text-[22px]">notifications</span>
                                <span class="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-surface-container-lowest"></span>
                            </button>
                        </div>

                        <!-- Help Option -->
                        <button class="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container hidden sm:block">
                            <span class="material-symbols-outlined text-[22px]">help</span>
                        </button>

                        <!-- User Profile Menu -->
                        <div class="flex items-center gap-stack-sm pl-2 border-l border-outline-variant dark:border-neutral-800">
                            <a href="../user_profile/index.html" class="flex items-center gap-stack-sm group">
                                <img src="${avatarUrl}" alt="${user.name}" class="w-8 h-8 rounded-full border border-violet-400 group-hover:scale-105 transition-all object-cover"/>
                                <div class="hidden lg:flex flex-col text-left">
                                    <span class="font-label-md text-label-md text-on-surface font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">${user.name}</span>
                                    <span class="text-[10px] text-on-surface-variant capitalize opacity-70">${user.role} Portal</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </header>
            `;

            container.innerHTML = html;
        },

        bindEvents: function () {
            // Theme toggle handler
            const themeBtn = document.getElementById('theme-toggle-btn');
            if (themeBtn) {
                themeBtn.addEventListener('click', () => {
                    const newTheme = window.EC_DB.toggleTheme();
                    const icon = document.getElementById('theme-icon');
                    if (icon) {
                        icon.innerText = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
                    }
                    // Optional callback for specific page updates
                    if (window.onThemeChange) {
                        window.onThemeChange(newTheme);
                    }
                });
            }

            // Mobile menu drawer toggles
            const openBtn = document.getElementById('sidebar-open-btn');
            const closeBtn = document.getElementById('sidebar-close-btn');
            const overlay = document.getElementById('sidebar-overlay');
            const drawer = document.getElementById('sidebar-drawer');

            if (openBtn && drawer && overlay) {
                openBtn.addEventListener('click', () => {
                    drawer.classList.remove('-translate-x-full');
                    overlay.classList.remove('hidden');
                });
            }

            const closeDrawer = () => {
                if (drawer && overlay) {
                    drawer.classList.add('-translate-x-full');
                    overlay.classList.add('hidden');
                }
            };

            if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
            if (overlay) overlay.addEventListener('click', closeDrawer);

            // Logout handler
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    window.EC_DB.logout();
                    // Redirect back to login screen index page
                    const parts = window.location.pathname.split('/');
                    const idx = parts.indexOf('stitch_event_management_hub');
                    const diff = parts.length - idx - 2;
                    window.location.href = '../'.repeat(Math.max(1, diff)) + 'login_registration/index.html';
                });
            }
        }
    };
})();
