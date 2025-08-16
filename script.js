const SchemaTree = {
    creationMode: false,
    projectData: {
        treeTitle: 'Tree',
        notesTitle: 'Notes',
        discussionTitle: 'Discussion',
        comments: []
    },
    buttonStates: {
        initial: {
            create: { text: 'Create', class: 'create-btn', handler: () => SchemaTree.enterCreationMode() },
            open: { text: 'Open', class: 'open-btn', handler: () => SchemaTree.loadProject() }
        },
        creation: {
            create: { text: 'Save', class: 'save-btn', handler: () => SchemaTree.saveProject() },
            exit: { text: 'Exit', class: 'exit-btn', handler: () => SchemaTree.exitCreationMode() }
        }
    },

    enterCreationMode() {
        if (!this.creationMode) {
            this.creationMode = true;
            document.body.classList.add('creation-mode');
            this.updateButtons('creation');
            this.addToolTabs();
            // Enable editing for Tree and Notes titles
            const treeTitle = document.querySelector('.tree-section .section-title');
            const notesTitle = document.querySelector('.notes-section .section-title');
            if (treeTitle) treeTitle.contentEditable = true;
            if (notesTitle) notesTitle.contentEditable = true;
        }
    },

    exitCreationMode() {
        if (this.creationMode) {
            this.creationMode = false;
            document.body.classList.remove('creation-mode');
            this.updateButtons('initial');
            this.removeToolTabs();
            // Disable editing and save titles
            const treeTitle = document.querySelector('.tree-section .section-title');
            const notesTitle = document.querySelector('.notes-section .section-title');
            if (treeTitle) {
                treeTitle.contentEditable = false;
                treeTitle.classList.remove('editing');
                this.saveTitleEdit(treeTitle);
            }
            if (notesTitle) {
                notesTitle.contentEditable = false;
                notesTitle.classList.remove('editing');
                this.saveTitleEdit(notesTitle);
            }
        }
    },

    updateButtons(mode) {
        const createBtn = document.querySelector('.create-btn, .save-btn');
        const openBtn = document.querySelector('.open-btn, .exit-btn');
        if (!createBtn || !openBtn) {
            console.error('Buttons not found');
            return;
        }

        // Clone buttons to remove old event listeners
        const newCreateBtn = createBtn.cloneNode(true);
        const newOpenBtn = openBtn.cloneNode(true);

        // Update button properties based on mode
        const state = this.buttonStates[mode];
        newCreateBtn.textContent = state.create.text;
        newCreateBtn.className = state.create.class;
        newOpenBtn.textContent = mode === 'creation' ? state.exit.text : state.open.text;
        newOpenBtn.className = mode === 'creation' ? state.exit.class : state.open.class;

        // Replace old buttons
        createBtn.replaceWith(newCreateBtn);
        openBtn.replaceWith(newOpenBtn);

        // Add new event listeners
        newCreateBtn.addEventListener('click', state.create.handler.bind(this));
        newOpenBtn.addEventListener('click', mode === 'creation' ? state.exit.handler.bind(this) : state.open.handler.bind(this));
    },

    addToolTabs() {
        const treeSection = document.querySelector('.tree-section');
        const notesSection = document.querySelector('.notes-section');
        if (!treeSection || !notesSection) {
            console.error('Sections not found');
            return;
        }
        const treeTitleContainer = treeSection.querySelector('.title-container');
        const notesTitleContainer = notesSection.querySelector('.title-container');
        treeSection.insertBefore(this.createTreeTools(), treeTitleContainer.nextSibling);
        notesSection.insertBefore(this.createNotesTools(), notesTitleContainer.nextSibling);

        // Event delegation for tool buttons
        treeSection.addEventListener('click', this.handleToolClick);
        notesSection.addEventListener('click', this.handleToolClick);
    },

    createTreeTools() {
        const treeTools = document.createElement('div');
        treeTools.className = 'tools';
        treeTools.innerHTML = `
            <button class="tool-btn" data-tooltip="Add a node">+</button>
            <button class="tool-btn" data-tooltip="Remove a node">-</button>
            <button class="tool-btn" data-tooltip="Draw or edit lines">✏️</button>
            <div style="flex-grow: 1;"></div>
            <button class="tool-btn" data-tooltip="Undo last change">⟲</button>
            <button class="tool-btn" data-tooltip="Redo last change">⟳</button>
        `;
        return treeTools;
    },

    createNotesTools() {
        const notesTools = document.createElement('div');
        notesTools.className = 'tools';
        notesTools.innerHTML = `
            <button class="tool-btn" data-tooltip="Add text">📝</button>
            <button class="tool-btn" data-tooltip="Attach files">📎</button>
            <button class="tool-btn" data-tooltip="Add forms">📋</button>
        `;
        return notesTools;
    },

    removeToolTabs() {
        const treeTools = document.querySelector('.tree-section .tools');
        const notesTools = document.querySelector('.notes-section .tools');
        if (treeTools) {
            treeTools.parentNode.removeEventListener('click', this.handleToolClick);
            treeTools.remove();
        }
        if (notesTools) {
            notesTools.parentNode.removeEventListener('click', this.handleToolClick);
            notesTools.remove();
        }
    },

    handleToolClick(e) {
        if (e.target.classList.contains('tool-btn')) {
            alert(`Clicked ${e.target.textContent} tool - Functionality to be added later!`);
        }
    },

    enableTitleEdit(titleElement) {
        if (!this.creationMode) return;
        titleElement.contentEditable = true;
        titleElement.focus();
        titleElement.classList.add('editing');
        const range = document.createRange();
        range.selectNodeContents(titleElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    },

    saveTitleEdit(titleElement) {
        titleElement.contentEditable = false;
        titleElement.classList.remove('editing');
        const newTitle = titleElement.textContent.trim();
        if (newTitle === '') {
            titleElement.textContent = titleElement.dataset.defaultTitle || 'Untitled';
        }
        titleElement.setAttribute('aria-label', `${titleElement.textContent} title`);
        // Update projectData
        const section = titleElement.closest('section');
        if (section.classList.contains('tree-section')) {
            this.projectData.treeTitle = titleElement.textContent;
        } else if (section.classList.contains('notes-section')) {
            this.projectData.notesTitle = titleElement.textContent;
        }
    },

    saveProject() {
        // Update titles in projectData
        const treeTitle = document.querySelector('.tree-section .section-title').textContent;
        const notesTitle = document.querySelector('.notes-section .section-title').textContent;
        const discussionTitle = document.querySelector('.discussion-section .section-title').textContent;
        this.projectData.treeTitle = treeTitle;
        this.projectData.notesTitle = notesTitle;
        this.projectData.discussionTitle = discussionTitle;

        // Save to localStorage
        localStorage.setItem('schemaTreeProject', JSON.stringify(this.projectData));
        this.exitCreationMode();
        alert('Project saved successfully!');
    },

    loadProject() {
        const savedData = localStorage.getItem('schemaTreeProject');
        if (savedData) {
            this.projectData = JSON.parse(savedData);
            const treeTitle = document.querySelector('.tree-section .section-title');
            const notesTitle = document.querySelector('.notes-section .section-title');
            const discussionTitle = document.querySelector('.discussion-section .section-title');
            if (treeTitle) {
                treeTitle.textContent = this.projectData.treeTitle;
                treeTitle.setAttribute('aria-label', `${this.projectData.treeTitle} title`);
            }
            if (notesTitle) {
                notesTitle.textContent = this.projectData.notesTitle;
                notesTitle.setAttribute('aria-label', `${this.projectData.notesTitle} title`);
            }
            if (discussionTitle) {
                discussionTitle.textContent = this.projectData.discussionTitle;
                discussionTitle.setAttribute('aria-label', `${this.projectData.discussionTitle} title`);
            }
            this.renderComments();
            alert('Project loaded successfully!');
        } else {
            alert('No saved project found.');
        }
    },

    addComment() {
        const commentField = document.querySelector('.comment-field');
        const commentText = commentField.value.trim();
        if (commentText) {
            const comment = {
                text: commentText,
                timestamp: new Date().toISOString()
            };
            this.projectData.comments.push(comment);
            commentField.value = '';
            this.renderComments();
        }
    },

    renderComments() {
        const commentsList = document.querySelector('.comments-list');
        if (!commentsList) return;
        commentsList.innerHTML = '';
        this.projectData.comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.textContent = `${comment.text} (${new Date(comment.timestamp).toLocaleString()})`;
            commentsList.appendChild(commentElement);
        });
    },

    init() {
        const createBtn = document.querySelector('.create-btn');
        const openBtn = document.querySelector('.open-btn');
        if (!createBtn || !openBtn) {
            console.error('Buttons not found');
            return;
        }

        createBtn.addEventListener('click', this.buttonStates.initial.create.handler.bind(this));
        openBtn.addEventListener('click', this.buttonStates.initial.open.handler.bind(this));

        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
            });
        }

        // Keyboard accessibility for tools
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('tool-btn')) {
                e.target.click();
            }
        });

        // Title editing for Tree and Notes only
        document.querySelectorAll('.tree-section .edit-title-btn, .notes-section .edit-title-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const titleElement = btn.previousElementSibling;
                if (titleElement && titleElement.classList.contains('section-title')) {
                    this.enableTitleEdit(titleElement);
                }
            });
        });

        document.querySelectorAll('.tree-section .section-title, .notes-section .section-title').forEach((title) => {
            title.dataset.defaultTitle = title.textContent;
            title.contentEditable = false; // Initially non-editable
            title.addEventListener('blur', () => this.saveTitleEdit(title));
            title.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveTitleEdit(title);
                }
            });
        });

        // Comment submission
        const commentBtn = document.querySelector('.comment-btn');
        const commentField = document.querySelector('.comment-field');
        if (commentBtn && commentField) {
            commentBtn.addEventListener('click', () => this.addComment());
            commentField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addComment();
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => SchemaTree.init());