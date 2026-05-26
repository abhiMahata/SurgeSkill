// EventCommand Database State Manager (localStorage client)

(function () {
    const DEFAULT_EVENTS = [
        {
            id: 'gis-2024',
            title: 'Global Innovation Summit 2026',
            date: '2026-05-22',
            description: 'Join industry leaders for an immersive experience in the future of AI and sustainable technology architecture.',
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
            venue: 'Moscone Center South, San Francisco',
            type: 'Conference',
            capacity: 500,
            price: '$299',
            registrationsCount: 456,
            status: 'Confirmed'
        },
        {
            id: 'ux-paradigm',
            title: 'The UX Paradigm shift',
            date: '2026-06-10',
            description: 'Explore the next frontier of user interfaces, cognitive load reduction, and dynamic design systems for enterprise systems.',
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
            venue: 'Design Hub, New York',
            type: 'Workshop',
            capacity: 150,
            price: '$99',
            registrationsCount: 88,
            status: 'Confirmed'
        },
        {
            id: 'tech-tea',
            title: 'Networking: Tech & Tea',
            date: '2026-06-25',
            description: 'An informal gathering of developers, designers, and managers to talk technology trends, tools, and share a cup of fine tea.',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
            venue: 'SOMA Lounge, San Francisco',
            type: 'Networking',
            capacity: 80,
            price: 'Free',
            registrationsCount: 45,
            status: 'Confirmed'
        },
        {
            id: 'data-arch-2023',
            title: 'Data Architecture 2025',
            date: '2025-08-12',
            description: 'Enterprise-scale data warehousing, real-time analytics, and streaming databases.',
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
            venue: 'Tech Center, Chicago',
            type: 'Conference',
            capacity: 300,
            price: '$199',
            registrationsCount: 300,
            status: 'Completed'
        },
        {
            id: 'prod-sync-2025',
            title: 'Product Strategy Sync',
            date: '2025-09-05',
            description: 'Aligning product roadmaps, user research, and executive vision.',
            image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
            venue: 'Hybrid / Silicon Valley',
            type: 'Workshop',
            capacity: 50,
            price: 'Free',
            registrationsCount: 50,
            status: 'Completed'
        }
    ];

    const DEFAULT_USERS = [
        {
            email: 'user@company.com',
            password: 'user',
            name: 'Sarah Jenkins',
            role: 'user',
            designation: 'Senior Product Designer',
            organization: 'DesignSystems Inc.',
            registeredEvents: ['gis-2024'],
            completedEvents: ['data-arch-2023', 'prod-sync-2025']
        },
        {
            email: 'admin@company.com',
            password: 'admin',
            name: 'Alex Rivera',
            role: 'admin',
            designation: 'Principal Operations Director',
            organization: 'Stitch Global Corp',
            registeredEvents: [],
            completedEvents: []
        }
    ];

    // Initialize Database
    function initDB() {
        if (!localStorage.getItem('ec_events')) {
            localStorage.setItem('ec_events', JSON.stringify(DEFAULT_EVENTS));
        }
        if (!localStorage.getItem('ec_users')) {
            localStorage.setItem('ec_users', JSON.stringify(DEFAULT_USERS));
        }
        if (!localStorage.getItem('ec_theme')) {
            localStorage.setItem('ec_theme', 'light');
        }
    }

    initDB();

    window.EC_DB = {
        // Theme functions
        getTheme: function () {
            return localStorage.getItem('ec_theme') || 'light';
        },
        setTheme: function (theme) {
            localStorage.setItem('ec_theme', theme);
            this.applyTheme();
        },
        applyTheme: function () {
            const theme = this.getTheme();
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
            }
        },
        toggleTheme: function () {
            const current = this.getTheme();
            const newTheme = current === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
            return newTheme;
        },

        // Auth functions
        getCurrentUser: function () {
            const email = sessionStorage.getItem('ec_current_user');
            if (!email) return null;
            const users = JSON.parse(localStorage.getItem('ec_users') || '[]');
            return users.find(u => u.email === email) || null;
        },
        login: function (email, password, expectedRole) {
            const users = JSON.parse(localStorage.getItem('ec_users') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            if (user) {
                if (expectedRole && user.role !== expectedRole) {
                    return { success: false, message: `Access denied. Account is not registered as an ${expectedRole}.` };
                }
                sessionStorage.setItem('ec_current_user', user.email);
                return { success: true, user: user };
            }
            return { success: false, message: 'Invalid corporate email or password.' };
        },
        register: function (name, email, password, role) {
            const users = JSON.parse(localStorage.getItem('ec_users') || '[]');
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                return { success: false, message: 'Corporate email is already registered.' };
            }
            const newUser = {
                email: email,
                password: password,
                name: name,
                role: role,
                designation: role === 'admin' ? 'Event Coordinator' : 'Attendee Partner',
                organization: 'Enterprise Inc.',
                registeredEvents: [],
                completedEvents: []
            };
            users.push(newUser);
            localStorage.setItem('ec_users', JSON.stringify(users));
            sessionStorage.setItem('ec_current_user', newUser.email);
            return { success: true, user: newUser };
        },
        logout: function () {
            sessionStorage.removeItem('ec_current_user');
        },
        updateProfile: function (profileData) {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;
            const users = JSON.parse(localStorage.getItem('ec_users') || '[]');
            const index = users.findIndex(u => u.email === currentUser.email);
            if (index !== -1) {
                users[index] = { ...users[index], ...profileData };
                localStorage.setItem('ec_users', JSON.stringify(users));
                return true;
            }
            return false;
        },

        // Events functions
        getEvents: function () {
            return JSON.parse(localStorage.getItem('ec_events') || '[]');
        },
        getEventById: function (id) {
            return this.getEvents().find(e => e.id === id) || null;
        },
        createEvent: function (eventData) {
            const events = this.getEvents();
            const newEvent = {
                id: 'evt-' + Date.now(),
                title: eventData.title,
                date: eventData.date,
                description: eventData.description,
                image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
                venue: eventData.venue,
                type: eventData.type,
                capacity: parseInt(eventData.capacity) || 100,
                price: eventData.price || 'Free',
                registrationsCount: 0,
                status: 'Confirmed'
            };
            events.unshift(newEvent);
            localStorage.setItem('ec_events', JSON.stringify(events));
            
            // Track admin activity
            this.addActivity(`Created new event "${newEvent.title}"`);
            return newEvent;
        },
        updateEvent: function (id, updatedData) {
            const events = this.getEvents();
            const index = events.findIndex(e => e.id === id);
            if (index !== -1) {
                events[index] = { ...events[index], ...updatedData };
                localStorage.setItem('ec_events', JSON.stringify(events));
                this.addActivity(`Updated event "${events[index].title}"`);
                return true;
            }
            return false;
        },
        deleteEvent: function (id) {
            let events = this.getEvents();
            const event = events.find(e => e.id === id);
            if (event) {
                events = events.filter(e => e.id !== id);
                localStorage.setItem('ec_events', JSON.stringify(events));
                this.addActivity(`Deleted event "${event.title}"`);
                return true;
            }
            return false;
        },
        toggleEventRegistration: function (id) {
            const user = this.getCurrentUser();
            if (!user) return { success: false, message: 'Please log in.' };
            
            const users = JSON.parse(localStorage.getItem('ec_users') || '[]');
            const events = this.getEvents();
            
            const uIndex = users.findIndex(u => u.email === user.email);
            const eIndex = events.findIndex(e => e.id === id);
            
            if (uIndex === -1 || eIndex === -1) return { success: false, message: 'User or Event not found.' };
            
            const isRegistered = users[uIndex].registeredEvents.includes(id);
            
            if (isRegistered) {
                // Unregister
                users[uIndex].registeredEvents = users[uIndex].registeredEvents.filter(rid => rid !== id);
                events[eIndex].registrationsCount = Math.max(0, events[eIndex].registrationsCount - 1);
                this.addActivity(`${user.name} cancelled registration for "${events[eIndex].title}"`);
            } else {
                // Register
                if (events[eIndex].registrationsCount >= events[eIndex].capacity) {
                    return { success: false, message: 'Event is fully booked.' };
                }
                users[uIndex].registeredEvents.push(id);
                events[eIndex].registrationsCount += 1;
                this.addActivity(`${user.name} registered for "${events[eIndex].title}"`);
            }
            
            localStorage.setItem('ec_users', JSON.stringify(users));
            localStorage.setItem('ec_events', JSON.stringify(events));
            return { success: true, registered: !isRegistered };
        },

        // Activity log functions
        getActivities: function () {
            return JSON.parse(localStorage.getItem('ec_activities') || '[]');
        },
        addActivity: function (action) {
            const activities = this.getActivities();
            const newAct = {
                id: 'act-' + Date.now(),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
                action: action
            };
            activities.unshift(newAct);
            localStorage.setItem('ec_activities', JSON.stringify(activities.slice(0, 50))); // Keep last 50
        }
    };

    // Apply active theme immediately on import
    window.EC_DB.applyTheme();
})();
