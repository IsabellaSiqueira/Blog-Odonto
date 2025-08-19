// Variáveis e Configurações
let posts = [];
const postsPerPage = 5;
let currentPage = 1;
let filteredPosts = [];

// Funções de Paginação e Exibição de Posts
function displayPosts(page) {
    const listaPostsDiv = document.getElementById('lista-de-posts');
    listaPostsDiv.innerHTML = '';

    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;

    const postsToDisplay = filteredPosts.length > 0 ? filteredPosts : posts;
    const paginatedItems = postsToDisplay.slice(startIndex, endIndex);

    if (paginatedItems.length === 0) {
        listaPostsDiv.innerHTML = '<p class="no-posts-message">Nenhum post disponível para esta categoria ou página.</p>';
        return;
    }

    paginatedItems.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post-resumo');
        postDiv.innerHTML = `
            <h3><a href="${post.arquivo}">${post.titulo}</a></h3>
            <p>${post.resumo}</p>
            <p class="post-meta">Categoria: ${post.categoria || 'Geral'}</p>
            <a href="${post.arquivo}" class="ler-mais-btn">Ler Mais</a>
        `;
        listaPostsDiv.appendChild(postDiv);
    });
}

function setupPagination() {
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.innerHTML = '';

    const postsToPaginate = filteredPosts.length > 0 ? filteredPosts : posts;
    const pageCount = Math.ceil(postsToPaginate.length / postsPerPage);

    if (pageCount <= 1) {
        return;
    }

    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement('button');
        btn.classList.add('pagination-btn');
        btn.innerText = i;
        if (i === currentPage) {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            currentPage = i;
            displayPosts(currentPage);
            document.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        paginationContainer.appendChild(btn);
    }
}

// Funções de Filtragem por Categoria
function getUniqueCategories() {
    const categories = new Set();
    posts.forEach(post => {
        if (post.categoria) {
            categories.add(post.categoria);
        }
    });
    return ['Todos', ...Array.from(categories)];
}

function setupCategoryFilters() {
    const categoryFilterContainer = document.getElementById('category-filters');
    categoryFilterContainer.innerHTML = '';

    const categories = getUniqueCategories();

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.classList.add('category-btn');
        btn.innerText = category;
        if (category === 'Todos') {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            filterPostsByCategory(category);
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        categoryFilterContainer.appendChild(btn);
    });
}

function filterPostsByCategory(category) {
    if (category === 'Todos') {
        filteredPosts = [];
    } else {
        filteredPosts = posts.filter(post => post.categoria === category);
    }
    currentPage = 1;
    displayPosts(currentPage);
    setupPagination();
}

// Lógica de UI (Menu e Cabeçalho)
function setupUIListeners() {
    // Lógica do Cabeçalho Fixo
    const mainHeader = document.getElementById('mainHeader');
    const scrollThreshold = window.innerHeight * 0.8;

    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Lógica do Menu Hambúrguer
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Lógica do Formulário de Contato
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatusMessage = document.getElementById('form-status-message');

    if (contactForm && submitBtn && formStatusMessage) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            formStatusMessage.style.display = 'none';

            const formData = new FormData(contactForm);
            const formUrl = contactForm.action;

            try {
                const response = await fetch(formUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatusMessage.textContent = 'Sua mensagem foi enviada com sucesso! Em breve entraremos em contato!';
                    formStatusMessage.classList.remove('error');
                    formStatusMessage.classList.add('success');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    const errorMessage = data.error || 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.';
                    formStatusMessage.textContent = errorMessage;
                    formStatusMessage.classList.remove('success');
                    formStatusMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                formStatusMessage.textContent = 'Não foi possível enviar a mensagem. Verifique sua conexão e tente novamente.';
                formStatusMessage.classList.remove('success');
                formStatusMessage.classList.add('error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Mensagem';
                formStatusMessage.style.display = 'block';
            }
        });
    }
}


// Inicialização do Site
document.addEventListener('DOMContentLoaded', () => {
    // Carregando os posts do JSON
    fetch('posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar os posts.');
            }
            return response.json();
        })
        .then(data => {
            posts = data;
            // Chame aqui todas as funções que dependem dos posts carregados
            setupCategoryFilters();
            filterPostsByCategory('Todos');
        })
        .catch(error => console.error('Houve um erro:', error));

    // Chame aqui as outras funções de inicialização
    setupUIListeners();
    setupContactForm();
});