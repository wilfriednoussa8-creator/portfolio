// ============================================
// CHATBOT — Assistant d'accueil (arbre de décision)
// Widget injecté dynamiquement, présent sur toutes les pages.
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  // Calcule le préfixe de chemin relatif selon la profondeur de la page actuelle
  // (les pages dans playground/ doivent utiliser ../ pour remonter à la racine)
  const isPlaygroundPage = window.location.pathname.includes('/playground/');
  const ROOT = isPlaygroundPage ? '../' : '';

  // --- Arbre de conversation ---
  const CONVERSATION_TREE = {
    root: {
      messages: [
        "Bonjour et bienvenue ! 👋",
        "Je suis l'assistant virtuel de Wilfried. Comment puis-je vous aider aujourd'hui ?"
      ],
      options: [
        { label: "Qui est Wilfried ?", next: "about" },
        { label: "Voir ses projets", next: "projects" },
        { label: "Explorer le Playground", next: "playground" },
        { label: "Voir ses compétences", next: "skills" },
        { label: "Le contacter", next: "contact" },
      ]
    },

    about: {
      messages: [
        "Wilfried est étudiant en double Master : Mathématiques Appliquées (Université de Douala) et Génie Logiciel (The Brain's University Institute).",
        "Il aime transformer des modèles mathématiques en applications concrètes, avec un focus Machine Learning / Data Science."
      ],
      options: [
        { label: "→ Voir la page About complète", link: "about.html" },
        { label: "Voir ses compétences", next: "skills" },
        { label: "⬅ Retour au menu", next: "root" },
      ]
    },

    projects: {
      messages: [
        "Wilfried a deux projets phares :",
        "🎓 Un système de gestion universitaire (Django, PostgreSQL) — livré et en production.",
        "📱 Une app mobile de gestion de stock avec prévision de ventes (Flutter + régression) — en développement actif."
      ],
      options: [
        { label: "→ Voir tous les projets", link: "projects.html" },
        { label: "⬅ Retour au menu", next: "root" },
      ]
    },

    playground: {
      messages: [
        "Le Playground est une expérience interactive : Math × Code, AI Lab et Data Lab.",
        "Vous pouvez y manipuler de vrais modèles mathématiques et algorithmes de Machine Learning en direct !"
      ],
      options: [
        { label: "→ Explorer le Playground", link: "playground/index.html" },
        { label: "⬅ Retour au menu", next: "root" },
      ]
    },

    skills: {
      messages: [
        "Ses compétences couvrent :",
        "🧮 Maths appliquées : modélisation, statistiques, analyse numérique",
        "🤖 ML/Data : Python, scikit-learn, Deep Learning",
        "💻 Dev : Django, Flutter, React, Node.js",
        "☁️ Cloud : AWS, GCP, Docker, Kubernetes"
      ],
      options: [
        { label: "→ Voir la page About complète", link: "about.html#skills" },
        { label: "⬅ Retour au menu", next: "root" },
      ]
    },

    contact: {
      messages: [
        "Vous pouvez joindre Wilfried directement :",
        "📧 wilfriednoussa8@gmail.com",
        "📞 +237 654 391 315",
        "Ou via le formulaire de contact du site."
      ],
      options: [
        { label: "→ Aller à la page Contact", link: "contact.html" },
        { label: "⬅ Retour au menu", next: "root" },
      ]
    },
  };

  // --- Construction du widget dans le DOM ---
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'chatbot-toggle';
  toggleBtn.innerHTML = `
    <i class="ti ti-message-circle-2 chat-icon"></i>
    <i class="ti ti-x close-icon"></i>
  `;

  const panel = document.createElement('div');
  panel.id = 'chatbot-panel';
  panel.innerHTML = `
    <div class="chatbot-header">
      <div class="bot-avatar">🤖</div>
      <div class="bot-info">
        <div class="bot-name">Assistant de Wilfried</div>
        <div class="bot-status">En ligne</div>
      </div>
    </div>
    <div class="chatbot-messages" id="chatbot-messages"></div>
    <div class="chatbot-options" id="chatbot-options"></div>
  `;

  document.body.appendChild(toggleBtn);
  document.body.appendChild(panel);

  const messagesEl = document.getElementById('chatbot-messages');
  const optionsEl = document.getElementById('chatbot-options');

  let hasGreeted = false;

  function addBotMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderOptions(options) {
    optionsEl.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chatbot-option-btn' + (opt.link ? ' link-option' : '');
      btn.textContent = opt.label;
      btn.addEventListener('click', () => handleOptionClick(opt));
      optionsEl.appendChild(btn);
    });
  }

  function goToNode(nodeId, delay = 300) {
    const node = CONVERSATION_TREE[nodeId];
    if (!node) return;

    setTimeout(() => {
      node.messages.forEach(msg => addBotMessage(msg));
      renderOptions(node.options);
    }, delay);
  }

  function handleOptionClick(opt) {
    addUserMessage(opt.label);
    optionsEl.innerHTML = '';

    if (opt.link) {
      setTimeout(() => {
        window.location.href = ROOT + opt.link;
      }, 400);
      return;
    }

    if (opt.next) {
      goToNode(opt.next);
    }
  }

  function openChat() {
    panel.classList.add('open');
    toggleBtn.classList.add('open');

    if (!hasGreeted) {
      hasGreeted = true;
      goToNode('root', 200);
    }
  }

  function closeChat() {
    panel.classList.remove('open');
    toggleBtn.classList.remove('open');
  }

  toggleBtn.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      closeChat();
    } else {
      openChat();
    }
  });
});
