// Utilitaire pour forcer le rechargement des settings
// Usage: Importer dans la console ou appeler après modification admin

export const forceSettingsRefresh = () => {
    localStorage.removeItem('pizzeria-settings');
    localStorage.removeItem('pizzeria-settings-timestamp');
    window.location.reload();
};

// Exposer globalement pour debug facile
if (typeof window !== 'undefined') {
    (window as any).forceSettingsRefresh = forceSettingsRefresh;
}
