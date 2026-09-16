import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only connect if user is authenticated
        if (user) {
            const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
            
            // Disable socket on Vercel to avoid connection errors (Serverless limitation)
            if (window.location.hostname.includes('vercel.app')) {
                console.log("Socket.io disabled on Vercel environment");
                return;
            }

            const newSocket = io(socketUrl, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log("Socket connected:", newSocket.id);
                setIsConnected(true);
                // Join user room
                if (user.id) {
                    newSocket.emit('join_user', user.id);
                }
            });

            newSocket.on('disconnect', () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            });

            newSocket.on('connect_error', (err) => {
                console.error("Socket connection error:", err);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            // If user logs out, disconnect socket if it exists
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user?.id]); // Re-run if user ID changes (login/logout/switch)

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
