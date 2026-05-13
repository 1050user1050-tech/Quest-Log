
export type Language = 'en' | 'pt' | 'es';

export interface TranslationSchema {
  tabs: {
    questlog: string;
    inventory: string;
    store: string;
    dungeons: string;
    profile: string;
    titles: string;
    calendar: string;
    manager: string;
  };
  managerTabs: {
    areas: string;
    xp: string;
    store: string;
    dungeons: string;
    titles: string;
    achievements: string;
    tasks: string;
  };
  stats: {
    level: string;
    xp: string;
    money: string;
    stamina: string;
    activeBuffs: string;
    noBuffs: string;
    recentFeats: string;
    noTasks: string;
    inventory: string;
    emptyInventory: string;
  };
  actions: {
    save: string;
    discard: string;
    create: string;
    edit: string;
    delete: string;
    add: string;
    refill: string;
    visibleInLog: string;
    buy: string;
    equip: string;
    equipped: string;
    locked: string;
    createTask: string;
    updateTask: string;
    abort: string;
    publish: string;
    addDomain: string;
    editDomain: string;
    addItem: string;
    editItem: string;
    addAchievement: string;
    editAchievement: string;
    back: string;
  };
  labels: {
    language: string;
    areaName: string;
    icon: string;
    color: string;
    scalingType: string;
    baseXp: string;
    decayXP: string;
    graceDays: string;
    maxStamina: string;
    currentGold: string;
    itemPrice: string;
    itemDescription: string;
    buffType: string;
    buffValue: string;
    itemName: string;
    titleName: string;
    titleDescription: string;
    searchQuest: string;
    status: string;
    rank: string;
    priority: string;
    showDungeonTasks: string;
    changeAvatar: string;
    difficulty: string;
    repeating: string;
    claimContract: string;
    taskName: string;
    taskDescription: string;
    targetArea: string;
    rewardXp: string;
    rewardGold: string;
    repeatingTask: string;
    respawns: string;
    intervalDays: string;
    dueDate: string;
    domainList: string;
    levelScale: string;
    decaySystem: string;
    stockInventory: string;
    legendsBureau: string;
    dangerZone: string;
    resetApp: string;
    resetDesc: string;
    expeditionLogs: string;
    rooms: string;
    cleared: string;
    active: string;
    noDungeonsRegistered: string;
    editProfile: string;
    baseStats: string;
    currentXP: string;
    backup: string;
    exportData: string;
    importData: string;
    autoSave: string;
    desktopHelp: string;
  };
  messages: {
    welcome: string;
    noDungeons: string;
    noDungeonsDesc: string;
    noQuestsFound: string;
    noQuestsDesc: string;
    completedRecently: string;
    searchResults: string;
    staminaRestored: string;
  };
  rankNames: {
    easy: string;
    medium: string;
    hard: string;
    elite: string;
  };
  statusNames: {
    all: string;
    active: string;
    completed: string;
  };
  priorityNames: {
    none: string;
    low: string;
    medium: string;
    high: string;
    urgent: string;
  };
  notifications: {
    levelUp: string;
    itemBought: string;
    noMoney: string;
    taskCompleted: string;
    savingChanges: string;
    avatarUpdated: string;
    importSuccess: string;
    importError: string;
  }
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    tabs: {
      questlog: "Quest Log",
      inventory: "Inventory",
      store: "Black Market",
      dungeons: "Expeditions",
      profile: "Hero Profile",
      titles: "Titles & Curses",
      calendar: "Chronicles",
      manager: "Manager Tool"
    },
    managerTabs: {
      areas: "Specializations",
      xp: "Stats & Progression",
      store: "Black Market",
      dungeons: "Dungeon Architect",
      titles: "Title Forge",
      achievements: "Achievements",
      tasks: "System"
    },
    stats: {
      level: "Level",
      xp: "XP",
      money: "Gold",
      stamina: "Stamina",
      activeBuffs: "Active Buffs",
      noBuffs: "No active buffs at the moment.",
      recentFeats: "Recent Feats",
      noTasks: "No tasks completed yet.",
      inventory: "Equipment & Inventory",
      emptyInventory: "Empty pockets. The journey has just begun."
    },
    actions: {
      save: "Save Modifications",
      discard: "Discard",
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      add: "Add",
      refill: "Refill",
      visibleInLog: "Visible in Log",
      buy: "Buy",
      equip: "Equip",
      equipped: "Equipped",
      locked: "Locked",
      createTask: "Create New Mission",
      updateTask: "Update Mission",
      abort: "Abort",
      publish: "Publish Mission",
      addDomain: "Specialization Workshop",
      editDomain: "Edit Specialization",
      addItem: "Black Market Forge",
      editItem: "Edit Ancient Relic",
      addAchievement: "Achievement Forge",
      editAchievement: "Edit Legends & Mythos",
      back: "Back to Chronicles"
    },
    labels: {
      language: "System Language",
      areaName: "Area Name",
      icon: "Icon",
      color: "Color",
      scalingType: "Scaling Type",
      baseXp: "Base XP",
      decayXP: "Inactivity Decay",
      graceDays: "Grace Days",
      maxStamina: "Max Stamina",
      currentGold: "Current Gold",
      itemPrice: "Price",
      itemDescription: "Description",
      buffType: "Buff Type",
      buffValue: "Buff Value",
      itemName: "Item Name",
      titleName: "Title Name",
      titleDescription: "Description",
      searchQuest: "Search Quests...",
      status: "Status",
      rank: "Rank",
      priority: "Priority",
      showDungeonTasks: "Dungeon Quests",
      changeAvatar: "Change",
      difficulty: "Difficulty",
      repeating: "Repeating",
      claimContract: "CLAIM CONTRACT",
      taskName: "Quest Name",
      taskDescription: "Quest Description",
      targetArea: "Target Area",
      rewardXp: "Reward (XP)",
      rewardGold: "Reward (Gold)",
      repeatingTask: "Repeating Task",
      respawns: "Respawns?",
      intervalDays: "Interval (Days)",
      dueDate: "Due Date",
      domainList: "Current Domains",
      levelScale: "Level Scaling",
      decaySystem: "Decay System",
      stockInventory: "Stock Inventory",
      legendsBureau: "Legends Bureau",
      dangerZone: "Danger Zone",
      resetApp: "Reset Application State",
      resetDesc: "Resetting will permanently delete all task history and items.",
      expeditionLogs: "Expedition Logs",
      rooms: "Rooms",
      cleared: "Cleared",
      active: "Active",
      noDungeonsRegistered: "No dungeons registered in the logs.",
      editProfile: "Edit Hero Profile",
      baseStats: "Core Stats",
      currentXP: "Current XP",
      backup: "Data Backup",
      exportData: "Download Backup File",
      importData: "Restore from File",
      autoSave: "Auto-save enabled (Local Storage)",
      desktopHelp: "Local usage: 1. Click menu (three dots) -> 'Export to GitHub/ZIP'. 2. Extract files. 3. Run 'questlog-windows.bat' (Windows) or 'python3 questlog-launcher.py' (Linux)."
    },
    messages: {
      welcome: "WELCOME TO QUESTLOG",
      noDungeons: "No Active Expeditions",
      noDungeonsDesc: "Use the Manager Tool to create grand projects and expeditions.",
      noQuestsFound: "No quests found with these filters.",
      noQuestsDesc: "Try expanding your hunting rank.",
      completedRecently: "Recently Completed Objectives",
      searchResults: "Search Results",
      staminaRestored: "Daily Stamina Restored!"
    },
    rankNames: {
      easy: "Easy (Noob)",
      medium: "Medium (Adept)",
      hard: "Hard (Expert)",
      elite: "Elite (Legend)"
    },
    statusNames: {
      all: "All Status",
      active: "Active Only",
      completed: "Completed"
    },
    priorityNames: {
      none: "Normal",
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent"
    },
    notifications: {
      levelUp: "LEVEL UP! You are now stronger.",
      itemBought: "Item acquired!",
      noMoney: "Not enough gold!",
      taskCompleted: "Quest Complete!",
      savingChanges: "Changes saved to the matrix.",
      avatarUpdated: "Avatar updated!",
      importSuccess: "Data restored successfully!",
      importError: "Failed to restore data. Invalid file format."
    }
  },
  pt: {
    tabs: {
      questlog: "Diário de Missões",
      inventory: "Inventário",
      store: "Mercado Negro",
      dungeons: "Expedições",
      profile: "Perfil de Herói",
      titles: "Títulos & Maldições",
      calendar: "Crônicas",
      manager: "Ferramenta de Gerente"
    },
    managerTabs: {
      areas: "Especializações",
      xp: "Status & Progressão",
      store: "Mercado Negro",
      dungeons: "Dungeon Architect",
      titles: "Forge de Títulos",
      achievements: "Conquistas",
      tasks: "Sistema"
    },
    stats: {
      level: "Nível",
      xp: "XP",
      money: "Gold",
      stamina: "Estamina",
      activeBuffs: "Bônus Ativos",
      noBuffs: "Sem buffs ativos no momento.",
      recentFeats: "Façanhas Recentes",
      noTasks: "Nenhuma tarefa concluída ainda.",
      inventory: "Equipamento & Inventário",
      emptyInventory: "Bolsos vazios. A jornada está apenas começando."
    },
    actions: {
      save: "Salvar Modificações",
      discard: "Descartar",
      create: "Criar",
      edit: "Editar",
      delete: "Excluir",
      add: "Adicionar",
      refill: "Recarregar",
      visibleInLog: "Visível no Log",
      buy: "Comprar",
      equip: "Equipar",
      equipped: "Equipado",
      locked: "Bloqueado",
      createTask: "Criar Nova Missão",
      updateTask: "Atualizar Missão",
      abort: "Abortar",
      publish: "Publicar Missão",
      addDomain: "Oficina de Especialização",
      editDomain: "Editar Especialização",
      addItem: "Forja do Mercado Negro",
      editItem: "Editar Relíquia Antiga",
      addAchievement: "Forja de Conquistas",
      editAchievement: "Editar Lendas & Mitos",
      back: "Voltar para Crônicas"
    },
    labels: {
      language: "Idioma do Sistema",
      areaName: "Nome da Área",
      icon: "Ícone",
      color: "Cor",
      scalingType: "Tipo de Escala",
      baseXp: "XP Base",
      decayXP: "Decaimento de Inatividade",
      graceDays: "Dias de Graça",
      maxStamina: "Estamina Máxima",
      currentGold: "Ouro Atual",
      itemPrice: "Preço",
      itemDescription: "Descrição",
      buffType: "Tipo de Bônus",
      buffValue: "Valor do Bônus",
      itemName: "Nome do Item",
      titleName: "Nome do Título",
      titleDescription: "Descrição",
      searchQuest: "Buscar Missões...",
      status: "Estado",
      rank: "Rank",
      priority: "Prioridade",
      showDungeonTasks: "Missões de Dungeon",
      changeAvatar: "Mudar",
      difficulty: "Dificuldade",
      repeating: "Repetível",
      claimContract: "REIVINDICAR CONTRATO",
      taskName: "Nome da Missão",
      taskDescription: "Descrição da Missão",
      targetArea: "Área de Foco",
      rewardXp: "Recompensa (XP)",
      rewardGold: "Recompensa (Ouro)",
      repeatingTask: "Missão Repetível",
      respawns: "Renasce?",
      intervalDays: "Interval (Dias)",
      dueDate: "Data de Entrega",
      domainList: "Domínios Atuais",
      levelScale: "Escala de Nível",
      decaySystem: "Sistema de Decaimento",
      stockInventory: "Inventário de Estoque",
      legendsBureau: "Escritório de Lendas",
      dangerZone: "Zona de Perigo",
      resetApp: "Resetar Estado da Aplicação",
      resetDesc: "O reset excluirá permanentemente todo o histórico de tarefas e itens.",
      expeditionLogs: "Registros de Expedição",
      rooms: "Salas",
      cleared: "Limpa",
      active: "Ativa",
      noDungeonsRegistered: "Nenhuma masmorra registrada nos logs.",
      editProfile: "Editar Perfil de Herói",
      baseStats: "Status Principais",
      currentXP: "XP Atual",
      backup: "Backup de Dados",
      exportData: "Baixar Arquivo de Backup",
      importData: "Restaurar de Arquivo",
      autoSave: "Auto-salvamento ativado (Local Storage)",
      desktopHelp: "Uso Local: 1. Clique no menu (três pontos) -> 'Export to GitHub/ZIP'. 2. Extraia os arquivos. 3. Execute 'questlog-windows.bat' (Windows) ou 'python3 questlog-launcher.py' (Linux)."
    },
    messages: {
      welcome: "BEM-VINDO AO QUESTLOG",
      noDungeons: "Sem Expedições Ativas",
      noDungeonsDesc: "Use o Manager Tool para criar grandes projetos e expedições.",
      noQuestsFound: "Nenhuma quest encontrada com esses filtros.",
      noQuestsDesc: "Tente expandir seu rank de caça.",
      completedRecently: "Objetivos Concluídos (Recentemente)",
      searchResults: "Resultados da Busca",
      staminaRestored: "Estamina Diária Restaurada!"
    },
    rankNames: {
      easy: "Easy (Noob)",
      medium: "Medium (Adept)",
      hard: "Hard (Expert)",
      elite: "Elite (Legend)"
    },
    statusNames: {
      all: "Todos os Status",
      active: "Apenas Ativas",
      completed: "Já Concluídas"
    },
    priorityNames: {
      none: "Normal",
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      urgent: "Urgente"
    },
    notifications: {
      levelUp: "LEVEL UP! Você está mais forte.",
      itemBought: "Item adquirido!",
      noMoney: "Ouro insuficiente!",
      taskCompleted: "Missão Concluída!",
      savingChanges: "Alterações salvas na matriz.",
      avatarUpdated: "Avatar atualizado!",
      importSuccess: "Dados restaurados com sucesso!",
      importError: "Falha ao restaurar dados. Formato de arquivo inválido."
    }
  },
  es: {
    tabs: {
      questlog: "Diario de Misiones",
      inventory: "Inventario",
      store: "Mercado Negro",
      dungeons: "Expediciones",
      profile: "Perfil de Héroe",
      titles: "Títulos y Maldiciones",
      calendar: "Crónicas",
      manager: "Herramienta de Gestión"
    },
    managerTabs: {
      areas: "Especializaciones",
      xp: "Estado y Progresión",
      store: "Mercado Negro",
      dungeons: "Arquitecto de Mazmorras",
      titles: "Forja de Títulos",
      achievements: "Logros",
      tasks: "Sistema"
    },
    stats: {
      level: "Nivel",
      xp: "XP",
      money: "Oro",
      stamina: "Estamina",
      activeBuffs: "Bonificaciones Activas",
      noBuffs: "Sin bonificaciones activas por ahora.",
      recentFeats: "Hazañas Recientes",
      noTasks: "Aún no se han completado tareas.",
      inventory: "Equipo e Inventario",
      emptyInventory: "Bolsillos vacíos. El viaje acaba de comenzar."
    },
    actions: {
      save: "Guardar Modificaciones",
      discard: "Descartar",
      create: "Crear",
      edit: "Editar",
      delete: "Eliminar",
      add: "Añadir",
      refill: "Recargar",
      visibleInLog: "Visible en Registro",
      buy: "Comprar",
      equip: "Equipar",
      equipped: "Equipado",
      locked: "Bloqueado",
      createTask: "Crear Nueva Misión",
      updateTask: "Actualizar Misión",
      abort: "Abortar",
      publish: "Publicar Misión",
      addDomain: "Taller de Especialización",
      editDomain: "Editar Especialización",
      addItem: "Forja del Mercado Negro",
      editItem: "Editar Reliquia Antigua",
      addAchievement: "Forja de Logros",
      editAchievement: "Editar Leyendas y Mitos",
      back: "Volver a Crónicas"
    },
    labels: {
      language: "Idioma del Sistema",
      areaName: "Nombre del Área",
      icon: "Icono",
      color: "Color",
      scalingType: "Tipo de Escala",
      baseXp: "XP Base",
      decayXP: "Decadencia de Inactividad",
      graceDays: "Días de Gracia",
      maxStamina: "Estamina Máxima",
      currentGold: "Oro Actual",
      itemPrice: "Precio",
      itemDescription: "Descripción",
      buffType: "Tipo de Bono",
      buffValue: "Valor de Bono",
      itemName: "Nombre del Objeto",
      titleName: "Nombre del Título",
      titleDescription: "Descripción",
      searchQuest: "Buscar Misiones...",
      status: "Estado",
      rank: "Rango",
      priority: "Prioridad",
      showDungeonTasks: "Misiones de Dungeon",
      changeAvatar: "Cambiar",
      difficulty: "Dificultad",
      repeating: "Repetible",
      claimContract: "RECLAMAR CONTRATO",
      taskName: "Nombre de la Misión",
      taskDescription: "Descripción de la Misión",
      targetArea: "Área de Enfoque",
      rewardXp: "Recompensa (XP)",
      rewardGold: "Recompensa (Oro)",
      repeatingTask: "Misión Repetible",
      respawns: "¿Reaparece?",
      intervalDays: "Intervalo (Días)",
      dueDate: "Fecha de Entrega",
      domainList: "Dominios Actuales",
      levelScale: "Escala de Nivel",
      decaySystem: "Sistema de Decadencia",
      stockInventory: "Inventario de Existencias",
      legendsBureau: "Oficina de Leyendas",
      dangerZone: "Zona de Peligro",
      resetApp: "Reiniciar Estado de la Aplicación",
      resetDesc: "El reinicio eliminará permanentemente todo el historial de tareas y objetos.",
      expeditionLogs: "Registros de Expedición",
      rooms: "Salas",
      cleared: "Limpiada",
      active: "Activa",
      noDungeonsRegistered: "No hay mazmorras registradas en los logs.",
      editProfile: "Editar Perfil de Héroe",
      baseStats: "Estadísticas Principales",
      currentXP: "XP Actual",
      backup: "Copia de Seguridad",
      exportData: "Descargar Archivo de Respaldo",
      importData: "Restaurar desde Archivo",
      autoSave: "Autoguardado activado (Local Storage)",
      desktopHelp: "Uso Local: 1. Haz clic en el menú (tres puntos) -> 'Export to GitHub/ZIP'. 2. Extrae los archivos. 3. Ejecuta 'questlog-windows.bat' (Windows) o 'python3 questlog-launcher.py' (Linux)."
    },
    messages: {
      welcome: "BIENVENIDO A QUESTLOG",
      noDungeons: "Sin Expediciones Activas",
      noDungeonsDesc: "Usa la Herramienta de Gestión para crear grandes proyectos y expediciones.",
      noQuestsFound: "No se encontraron misiones con estos filtros.",
      noQuestsDesc: "Intenta expandir tu rango de caza.",
      completedRecently: "Objetivos Completados (Recientemente)",
      searchResults: "Resultados de la Búsqueda",
      staminaRestored: "¡Estamina Diaria Restaurada!"
    },
    rankNames: {
      easy: "Easy (Noob)",
      medium: "Medium (Adept)",
      hard: "Hard (Expert)",
      elite: "Elite (Legend)"
    },
    statusNames: {
      all: "Todos los Estados",
      active: "Solo Activas",
      completed: "Completadas"
    },
    priorityNames: {
      none: "Normal",
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente"
    },
    notifications: {
      levelUp: "¡SUBIDA DE NIVEL! Ahora eres más fuerte.",
      itemBought: "¡Objeto adquirido!",
      noMoney: "¡Oro insuficiente!",
      taskCompleted: "¡Misión Completada!",
      savingChanges: "Cambios guardados en la matriz.",
      avatarUpdated: "¡Avatar actualizado!",
      importSuccess: "¡Datos restaurados con éxito!",
      importError: "Error al restaurar los datos. Formato de archivo inválido."
    }
  }
};
