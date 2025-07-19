// SobraBoa - JavaScript Completo Consolidado
class SobraBoa {
    constructor() {
        this.currentScreen = 'dashboard';
        this.isLoggedIn = false;
        this.user = { name: 'Danilo', email: 'danilo@email.com' };
        this.foods = [
            { id: 1, name: 'Alface', quantity: '1 pé', expiry: '2025-07-21', location: 'geladeira', status: 'warning' },
            { id: 2, name: 'Queijo Mussarela', quantity: '200g', expiry: '2025-07-25', location: 'geladeira', status: 'ok' },
            { id: 3, name: 'Pão de Forma', quantity: '1 pacote', expiry: '2025-07-18', location: 'despensa', status: 'expired' },
            { id: 4, name: 'Tomate', quantity: '4 unidades', expiry: '2025-07-24', location: 'geladeira', status: 'ok' },
            { id: 5, name: 'Leite', quantity: '1L', expiry: '2025-07-20', location: 'geladeira', status: 'warning' }
        ];
        this.recipes = [
            { id: 1, name: 'Salada Verde', time: '10 min', difficulty: 'Fácil', ingredients: ['Alface', 'Tomate'], priority: true },
            { id: 2, name: 'Sanduíche Caprese', time: '15 min', difficulty: 'Fácil', ingredients: ['Pão de Forma', 'Queijo Mussarela', 'Tomate'], priority: true },
            { id: 3, name: 'Vitamina de Leite', time: '5 min', difficulty: 'Fácil', ingredients: ['Leite'], priority: true },
            { id: 4, name: 'Omelete com Queijo', time: '20 min', difficulty: 'Médio', ingredients: ['Queijo Mussarela'], priority: false }
        ];
        
        // Propriedades para planejamento semanal
        this.weekPlan = {
            'Segunda': { breakfast: '', lunch: '', dinner: '' },
            'Terça': { breakfast: '', lunch: '', dinner: '' },
            'Quarta': { breakfast: '', lunch: '', dinner: '' },
            'Quinta': { breakfast: '', lunch: '', dinner: '' },
            'Sexta': { breakfast: '', lunch: '', dinner: '' },
            'Sábado': { breakfast: '', lunch: '', dinner: '' },
            'Domingo': { breakfast: '', lunch: '', dinner: '' }
        };
        
        this.editingFoodId = null;
        this.currentEditingMeal = null;
        
        this.init();
    }

    init() {
        this.updateFoodStatuses();
        this.bindEvents();
        this.showScreen('login-screen');
    }

    bindEvents() {
        // Login buttons
        document.getElementById('login-google')?.addEventListener('click', () => this.login());
        document.getElementById('login-email')?.addEventListener('click', () => this.login());
        document.getElementById('create-account')?.addEventListener('click', () => this.login());
        document.getElementById('guest-login')?.addEventListener('click', () => this.login());

        // Dashboard cards
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.navigateToScreen(screen);
            });
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.currentTarget.dataset.screen;
                this.navigateToScreen(screen);
            });
        });

        // Add food button
        document.getElementById('add-food-btn')?.addEventListener('click', () => {
            this.showAddFoodModal();
        });

        // Modal close buttons
        document.getElementById('close-add-modal')?.addEventListener('click', () => {
            this.hideModal('add-food-modal');
        });

        document.getElementById('close-edit-modal')?.addEventListener('click', () => {
            this.hideModal('edit-food-modal');
        });

        // Form submissions
        document.getElementById('add-food-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFood();
        });

        document.getElementById('edit-food-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateFood();
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideModal(e.currentTarget.parentElement.id);
                }
            });
        });

        // Bind planning events
        this.bindPlanningEvents();
    }

    bindPlanningEvents() {
        // Planning screen meal editing
        document.querySelectorAll('.meal-value').forEach(mealValue => {
            mealValue.addEventListener('click', (e) => {
                const day = e.target.dataset.day;
                const mealType = e.target.dataset.mealLabel;
                this.editMeal(day, mealType);
            });
        });

        // Shopping list button
        document.getElementById('generate-shopping-list')?.addEventListener('click', () => {
            this.generateShoppingList();
        });

        // Modal events for planning
        document.getElementById('close-meal-modal')?.addEventListener('click', () => {
            this.hideModal('edit-meal-modal');
        });

        document.getElementById('close-shopping-modal')?.addEventListener('click', () => {
            this.hideModal('shopping-list-modal');
        });

        document.getElementById('edit-meal-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMeal();
        });

        document.getElementById('copy-shopping-list')?.addEventListener('click', () => {
            this.copyShoppingList();
        });

        document.getElementById('export-shopping-list')?.addEventListener('click', () => {
            this.exportShoppingList();
        });
    }

    login() {
        this.isLoggedIn = true;
        this.showScreen('dashboard-screen');
        document.getElementById('main-header').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        this.updateDashboard();
        this.updateExpiringBadge();
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        document.getElementById(screenId)?.classList.remove('hidden');
        
        // Update navigation
        this.updateNavigation(screenId);
    }

    navigateToScreen(screenName) {
        const screenId = screenName + '-screen';
        this.currentScreen = screenName;
        this.showScreen(screenId);
        
        // Update content based on screen
        switch(screenName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'inventory':
                this.updateInventoryList();
                break;
            case 'expiring':
                this.updateExpiringList();
                break;
            case 'recipes':
                this.updateRecipesList();
                break;
            case 'planning':
                this.updatePlanningScreen();
                break;
            case 'profile':
                this.updateProfile();
                break;
        }
    }

    updateNavigation(screenId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const screenName = screenId.replace('-screen', '');
        const activeBtn = document.querySelector(`[data-screen="${screenName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    updateFoodStatuses() {
        const today = new Date();
        this.foods = this.foods.map(food => {
            const expiryDate = new Date(food.expiry);
            const diffTime = expiryDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return { ...food, status: 'expired' };
            if (diffDays <= 2) return { ...food, status: 'warning' };
            return { ...food, status: 'ok' };
        });
    }

    getStatusIcon(status) {
        switch(status) {
            case 'ok': return '🟢';
            case 'warning': return '🟡';
            case 'expired': return '🔴';
            default: return '⚪';
        }
    }

    getStatusClass(status) {
        switch(status) {
            case 'ok': return 'expiry-ok';
            case 'warning': return 'expiry-warning';
            case 'expired': return 'expiry-expired';
            default: return '';
        }
    }

    formatExpiryText(food) {
        const today = new Date();
        const expiryDate = new Date(food.expiry);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Vencido';
        if (diffDays === 0) return 'Vence hoje';
        if (diffDays === 1) return 'Vence amanhã';
        if (diffDays <= 2) return `Vence em ${diffDays} dias`;
        return `Vence em ${expiryDate.toLocaleDateString('pt-BR')}`;
    }

    updateDashboard() {
        document.getElementById('user-name').textContent = this.user.name;
        
        // Update summary stats
        const okCount = this.foods.filter(f => f.status === 'ok').length;
        const warningCount = this.foods.filter(f => f.status === 'warning').length;
        const expiredCount = this.foods.filter(f => f.status === 'expired').length;
        
        document.getElementById('foods-ok').textContent = okCount;
        document.getElementById('foods-warning').textContent = warningCount;
        document.getElementById('foods-expired').textContent = expiredCount;
    }

    updateExpiringBadge() {
        const expiringCount = this.foods.filter(f => f.status === 'warning' || f.status === 'expired').length;
        const badge = document.getElementById('expiring-badge');
        const countElement = document.getElementById('expiring-count');
        
        if (expiringCount > 0) {
            badge.classList.remove('hidden');
            countElement.textContent = expiringCount;
        } else {
            badge.classList.add('hidden');
        }
    }

    updateInventoryList() {
        const container = document.getElementById('foods-list');
        container.innerHTML = '';
        
        this.foods.forEach(food => {
            const foodElement = this.createFoodItem(food);
            container.appendChild(foodElement);
        });
    }

    createFoodItem(food) {
        const div = document.createElement('div');
        div.className = 'food-item';
        div.innerHTML = `
            <div class="food-info">
                <span class="food-status-icon">${this.getStatusIcon(food.status)}</span>
                <div class="food-details">
                    <p class="food-name">${food.name}</p>
                    <p class="food-meta">${food.quantity} • ${food.location}</p>
                    <p class="food-expiry ${this.getStatusClass(food.status)}">${this.formatExpiryText(food)}</p>
                </div>
            </div>
            <div class="food-actions">
                <button class="btn-icon btn-edit" onclick="app.editFood(${food.id})">✏️</button>
                <button class="btn-icon btn-delete" onclick="app.deleteFood(${food.id})">🗑️</button>
            </div>
        `;
        return div;
    }

    updateExpiringList() {
        const container = document.getElementById('expiring-foods-list');
        const noExpiringElement = document.getElementById('no-expiring-foods');
        const expiringFoods = this.foods.filter(f => f.status === 'warning' || f.status === 'expired');
        
        container.innerHTML = '';
        
        if (expiringFoods.length === 0) {
            container.classList.add('hidden');
            noExpiringElement.classList.remove('hidden');
        } else {
            container.classList.remove('hidden');
            noExpiringElement.classList.add('hidden');
            
            expiringFoods.forEach(food => {
                const foodElement = this.createExpiringFoodItem(food);
                container.appendChild(foodElement);
            });
        }
    }

    createExpiringFoodItem(food) {
        const div = document.createElement('div');
        div.className = 'expiring-food-item';
        div.innerHTML = `
            <div class="food-info">
                <span class="food-status-icon">${this.getStatusIcon(food.status)}</span>
                <div class="food-details">
                    <p class="food-name">${food.name}</p>
                    <p class="food-quantity">${food.quantity}</p>
                    <p class="food-status-text ${this.getStatusClass(food.status)}">${this.formatExpiryText(food)}</p>
                </div>
            </div>
            <button class="btn btn-green btn-sm" onclick="app.navigateToScreen('recipes')">Ver Receitas</button>
        `;
        return div;
    }

    updateRecipesList() {
        const container = document.getElementById('recipes-list');
        const ingredientsElement = document.getElementById('available-ingredients-list');
        
        // Update available ingredients
        const availableIngredients = this.getAvailableIngredients();
        ingredientsElement.textContent = availableIngredients.join(', ');
        
        // Update recipes
        container.innerHTML = '';
        const matchingRecipes = this.getMatchingRecipes();
        
        matchingRecipes.forEach(recipe => {
            const recipeElement = this.createRecipeItem(recipe);
            container.appendChild(recipeElement);
        });
    }

    getAvailableIngredients() {
        return this.foods.filter(food => food.status !== 'expired').map(food => food.name);
    }

    getMatchingRecipes() {
        const available = this.getAvailableIngredients();
        return this.recipes.filter(recipe => 
            recipe.ingredients.some(ingredient => available.includes(ingredient))
        ).sort((a, b) => b.priority - a.priority);
    }

    createRecipeItem(recipe) {
        const div = document.createElement('div');
        div.className = 'recipe-item';
        div.innerHTML = `
            <div class="recipe-header">
                <h3 class="recipe-name">${recipe.name}</h3>
                ${recipe.priority ? '<span class="priority-badge">Prioridade</span>' : ''}
            </div>
            <div class="recipe-meta">
                <span class="recipe-time">⏱️ ${recipe.time}</span>
                <span class="recipe-difficulty">${recipe.difficulty}</span>
            </div>
            <p class="recipe-ingredients">Ingredientes: ${recipe.ingredients.join(', ')}</p>
        `;
        return div;
    }

    updateProfile() {
        document.getElementById('profile-name').value = this.user.name;
        document.getElementById('profile-email').value = this.user.email;
    }

    // PLANNING FUNCTIONS
    updatePlanningScreen() {
        // Atualizar as refeições na tela de planejamento
        Object.entries(this.weekPlan).forEach(([day, meals]) => {
            const dayElement = Array.from(document.querySelectorAll('.day-plan h3'))
                .find(h3 => h3.textContent === day)?.parentElement;
            
            if (dayElement) {
                const mealRows = dayElement.querySelectorAll('.meal-row');
                const mealTypes = ['breakfast', 'lunch', 'dinner'];
                
                mealRows.forEach((row, index) => {
                    const mealValue = row.querySelector('.meal-value');
                    const value = meals[mealTypes[index]];
                    
                    if (value) {
                        mealValue.textContent = value;
                        mealValue.classList.remove('empty');
                        mealValue.classList.add('filled');
                    } else {
                        mealValue.textContent = 'Não planejado';
                        mealValue.classList.add('empty');
                        mealValue.classList.remove('filled');
                    }
                });
            }
        });
    }

    editMeal(day, mealType) {
        const mealTypeMap = {
            'Café da manhã': 'breakfast',
            'Almoço': 'lunch',
            'Jantar': 'dinner'
        };
        
        const mealKey = mealTypeMap[mealType];
        this.currentEditingMeal = { day, mealType: mealKey };
        
        document.getElementById('meal-day').value = day;
        document.getElementById('meal-type').value = mealType;
        document.getElementById('meal-value').value = this.weekPlan[day][mealKey] || '';
        
        this.showModal('edit-meal-modal');
    }

    saveMeal() {
        if (!this.currentEditingMeal) return;
        
        const { day, mealType } = this.currentEditingMeal;
        const value = document.getElementById('meal-value').value.trim();
        
        this.weekPlan[day][mealType] = value;
        this.updatePlanningScreen();
        this.hideModal('edit-meal-modal');
        this.currentEditingMeal = null;
        
        this.showToast('Refeição salva com sucesso! 🍽️');
    }

    generateShoppingList() {
        const plannedMeals = this.getPlannedMeals();
        const neededIngredients = this.getNeededIngredients(plannedMeals);
        const availableIngredients = this.getAvailableIngredients();
        
        // Filtrar ingredientes que não temos
        const shoppingItems = neededIngredients.filter(ingredient => 
            !availableIngredients.includes(ingredient)
        );
        
        // Categorizar ingredientes
        const categorizedItems = this.categorizeIngredients(shoppingItems);
        
        this.displayShoppingList(categorizedItems, plannedMeals);
        this.showModal('shopping-list-modal');
    }

    getPlannedMeals() {
        const meals = [];
        Object.entries(this.weekPlan).forEach(([day, dayMeals]) => {
            Object.entries(dayMeals).forEach(([mealType, meal]) => {
                if (meal) {
                    const mealTypeNames = {
                        breakfast: 'Café da manhã',
                        lunch: 'Almoço',
                        dinner: 'Jantar'
                    };
                    meals.push({
                        day,
                        mealType: mealTypeNames[mealType],
                        meal
                    });
                }
            });
        });
        return meals;
    }

    getNeededIngredients(plannedMeals) {
        const ingredients = new Set();
        
        // Adicionar ingredientes das receitas planejadas
        plannedMeals.forEach(({ meal }) => {
            const recipe = this.recipes.find(r => r.name === meal);
            if (recipe) {
                recipe.ingredients.forEach(ingredient => ingredients.add(ingredient));
            }
        });
        
        // Adicionar ingredientes básicos sugeridos
        const basicIngredients = [
            'Arroz', 'Feijão', 'Óleo', 'Sal', 'Açúcar', 'Café', 'Pão',
            'Ovos', 'Leite', 'Manteiga', 'Cebola', 'Alho'
        ];
        
        basicIngredients.forEach(ingredient => ingredients.add(ingredient));
        
        return Array.from(ingredients);
    }

    categorizeIngredients(ingredients) {
        const categories = {
            'Frutas e Verduras': ['Alface', 'Tomate', 'Cebola', 'Alho', 'Cenoura', 'Batata'],
            'Laticínios': ['Queijo Mussarela', 'Ovos', 'Leite', 'Iogurte', 'Manteiga'],
            'Padaria': ['Pão de Forma', 'Pão'],
            'Proteínas': ['Frango', 'Carne', 'Peixe'],
            'Despensa': ['Arroz', 'Feijão', 'Macarrão', 'Aveia', 'Açúcar', 'Sal', 'Óleo', 'Café'],
            'Congelados': [],
            'Outros': []
        };
        
        const categorized = {};
        
        // Inicializar categorias
        Object.keys(categories).forEach(category => {
            categorized[category] = [];
        });
        
        // Categorizar ingredientes
        ingredients.forEach(ingredient => {
            let assigned = false;
            
            for (const [category, items] of Object.entries(categories)) {
                if (items.includes(ingredient)) {
                    categorized[category].push(ingredient);
                    assigned = true;
                    break;
                }
            }
            
            if (!assigned) {
                categorized['Outros'].push(ingredient);
            }
        });
        
        // Remover categorias vazias
        Object.keys(categorized).forEach(category => {
            if (categorized[category].length === 0) {
                delete categorized[category];
            }
        });
        
        return categorized;
    }

    displayShoppingList(categorizedItems, plannedMeals) {
        // Display planned meals
        const plannedMealsList = document.getElementById('planned-meals-list');
        if (plannedMealsList) {
            plannedMealsList.innerHTML = '';
            plannedMeals.forEach(({ day, mealType, meal }) => {
                const div = document.createElement('div');
                div.className = 'planned-meal-item';
                div.innerHTML = `
                    <span class="meal-day-time">${day} - ${mealType}:</span>
                    <span class="meal-name">${meal}</span>
                `;
                plannedMealsList.appendChild(div);
            });
        }

        // Display shopping categories
        const categoryMapping = {
            'Frutas e Verduras': { icon: '🥬', id: 'category-produce' },
            'Laticínios': { icon: '🥛', id: 'category-dairy' },
            'Padaria': { icon: '🍞', id: 'category-bakery' },
            'Proteínas': { icon: '🥩', id: 'category-protein' },
            'Despensa': { icon: '🏪', id: 'category-pantry' },
            'Congelados': { icon: '🧊', id: 'category-frozen' },
            'Outros': { icon: '🧴', id: 'category-others' }
        };

        Object.entries(categorizedItems).forEach(([category, items]) => {
            const mapping = categoryMapping[category];
            if (mapping) {
                const container = document.getElementById(mapping.id);
                if (container) {
                    container.innerHTML = '';
                    items.forEach((item, index) => {
                        const div = document.createElement('div');
                        div.className = 'shopping-item';
                        div.innerHTML = `
                            <input type="checkbox" id="item-${category}-${index}">
                            <label for="item-${category}-${index}">${item}</label>
                        `;
                        container.appendChild(div);
                    });

                    // Show/hide category based on items
                    const categoryDiv = container.closest('.shopping-category');
                    if (categoryDiv) {
                        if (items.length > 0) {
                            categoryDiv.style.display = 'block';
                        } else {
                            categoryDiv.style.display = 'none';
                        }
                    }
                }
            }
        });

        // Add checkbox events
        document.querySelectorAll('.shopping-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const item = e.target.closest('.shopping-item');
                if (e.target.checked) {
                    item.classList.add('checked');
                } else {
                    item.classList.remove('checked');
                }
            });
        });
    }

    copyShoppingList() {
        const categories = document.querySelectorAll('.shopping-category');
        let listText = '📋 LISTA DE COMPRAS - SobraBoa\n\n';
        
        // Add planned meals
        const plannedMeals = this.getPlannedMeals();
        if (plannedMeals.length > 0) {
            listText += '📝 REFEIÇÕES PLANEJADAS:\n';
            plannedMeals.forEach(({ day, mealType, meal }) => {
                listText += `• ${day} - ${mealType}: ${meal}\n`;
            });
            listText += '\n';
        }
        
        categories.forEach(category => {
            const categoryTitle = category.querySelector('h4');
            const items = Array.from(category.querySelectorAll('.shopping-item label'));
            
            if (categoryTitle && items.length > 0) {
                const categoryName = categoryTitle.textContent;
                listText += `${categoryName.toUpperCase()}\n`;
                items.forEach(label => {
                    listText += `☐ ${label.textContent}\n`;
                });
                listText += '\n';
            }
        });
        
        listText += 'Gerada pelo app SobraBoa 🥬';
        
        // Copy to clipboard
        this.copyToClipboard(listText);
        this.showToast('Lista copiada! 📱');
    }

    exportShoppingList() {
        const categories = document.querySelectorAll('.shopping-category');
        let listText = 'LISTA DE COMPRAS - SobraBoa\n\n';
        
        categories.forEach(category => {
            const categoryTitle = category.querySelector('h4');
            const items = Array.from(category.querySelectorAll('.shopping-item label'));
            
            if (categoryTitle && items.length > 0) {
                const categoryName = categoryTitle.textContent;
                listText += `${categoryName}\n`;
                items.forEach(label => {
                    listText += `- ${label.textContent}\n`;
                });
                listText += '\n';
            }
        });
        
        // Create and download file
        const blob = new Blob([listText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista-compras-sobraboa.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Lista exportada! 📤');
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // FOOD MANAGEMENT FUNCTIONS
    showAddFoodModal() {
        this.clearAddFoodForm();
        this.showModal('add-food-modal');
    }

    clearAddFoodForm() {
        document.getElementById('new-food-name').value = '';
        document.getElementById('new-food-quantity').value = '';
        document.getElementById('new-food-expiry').value = '';
        document.getElementById('new-food-location').value = 'geladeira';
    }

    addFood() {
        const name = document.getElementById('new-food-name').value.trim();
        const quantity = document.getElementById('new-food-quantity').value.trim();
        const expiry = document.getElementById('new-food-expiry').value;
        const location = document.getElementById('new-food-location').value;
        
        if (!name || !quantity || !expiry) {
            this.showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const newFood = {
            id: Date.now(),
            name,
            quantity,
            expiry,
            location,
            status: 'ok'
        };
        
        this.foods.push(newFood);
        this.updateFoodStatuses();
        this.hideModal('add-food-modal');
        this.updateInventoryList();
        this.updateDashboard();
        this.updateExpiringBadge();
        this.showToast('Alimento adicionado com sucesso! 🥬');
    }

    editFood(id) {
        const food = this.foods.find(f => f.id === id);
        if (!food) return;
        
        this.editingFoodId = id;
        document.getElementById('edit-food-name').value = food.name;
        document.getElementById('edit-food-quantity').value = food.quantity;
        document.getElementById('edit-food-expiry').value = food.expiry;
        document.getElementById('edit-food-location').value = food.location;
        
        this.showModal('edit-food-modal');
    }

    updateFood() {
        if (!this.editingFoodId) return;
        
        const name = document.getElementById('edit-food-name').value.trim();
        const quantity = document.getElementById('edit-food-quantity').value.trim();
        const expiry = document.getElementById('edit-food-expiry').value;
        const location = document.getElementById('edit-food-location').value;
        
        if (!name || !quantity || !expiry) {
            this.showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const foodIndex = this.foods.findIndex(f => f.id === this.editingFoodId);
        if (foodIndex !== -1) {
            this.foods[foodIndex] = {
                ...this.foods[foodIndex],
                name,
                quantity,
                expiry,
                location
            };
        }
        
        this.updateFoodStatuses();
        this.editingFoodId = null;
        this.hideModal('edit-food-modal');
        this.updateInventoryList();
        this.updateDashboard();
        this.updateExpiringBadge();
        this.showToast('Alimento atualizado com sucesso! ✏️');
    }

    deleteFood(id) {
        if (confirm('Tem certeza que deseja excluir este alimento?')) {
            this.foods = this.foods.filter(f => f.id !== id);
            this.updateInventoryList();
            this.updateDashboard();
            this.updateExpiringBadge();
            this.showToast('Alimento removido! 🗑️');
        }
    }

    // MODAL FUNCTIONS
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SobraBoa();
    console.log('SobraBoa initialized successfully! 🥬');
});

// Export for potential use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SobraBoa;
}