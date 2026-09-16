import { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/admin.service';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    // Initial settings with defaults
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('appSettings');
        return saved ? JSON.parse(saved) : {
            platformName: 'Project Crypto',
            maintenanceMode: false,
            showPaymentLink: true,
            enableTicketSystem: true,
            enable2FA: false,
            supportLinkPersonal: 'https://t.me/admin',
            supportLinkChannel: 'https://t.me/channel',
            telegramBotToken: '',
            telegramChannelId: '',
            minWithdrawal: 10,
            withdrawalFee: 5,
            requireWithdrawVerification: false,
            requireTxHash: true
        };
    });
    const [loading, setLoading] = useState(true);

    // Fetch from backend on load
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminService.getSettings();
                setSettings(data);
                localStorage.setItem('appSettings', JSON.stringify(data));
            } catch (error) {
                console.error('Failed to sync settings with server', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings) => {
        try {
            // Optimistic update
            setSettings(prev => ({ ...prev, ...newSettings }));
            
            // Sync with server
            const updated = await adminService.updateSettings(newSettings);
            setSettings(updated);
            localStorage.setItem('appSettings', JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.error('Failed to update settings on server', error);
            throw error;
        }
    };

    const value = {
        settings,
        updateSettings,
        loading
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
