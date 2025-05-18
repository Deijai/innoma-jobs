import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserType = 'professional' | 'recruiter';

interface UserData {
  uid: string;
  email: string | null;
  userType: UserType;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  register: (email: string, password: string, userType: UserType) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Monitora mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Busca dados adicionais do usuário no Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
          
          // Salva o usuário no AsyncStorage para persistência
          await AsyncStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      } else {
        setUserData(null);
        await AsyncStorage.removeItem('user');
      }
      
      setIsLoading(false);
    });

    // Verifica se há um usuário salvo no AsyncStorage
    const checkStoredUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser && !user) {
        // Se houver usuário no storage, mas não no state, atualizamos
        setUser(JSON.parse(storedUser));
      }
      
      setIsLoading(false);
    };

    checkStoredUser();

    // Cleanup da assinatura quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Registro de novo usuário
  const register = async (email: string, password: string, userType: UserType) => {
    setIsLoading(true);
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Cria documento do usuário no Firestore
      const newUserData: UserData = {
        uid: result.user.uid,
        email: result.user.email,
        userType,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', result.user.uid), newUserData);
      setUserData(newUserData);
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  // Login de usuário
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  // Recuperação de senha
  const resetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Atualiza os dados do usuário
  const updateUserData = async (data: Partial<UserData>) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...userData, ...data }, { merge: true });
      
      // Atualiza o estado local
      setUserData(curr => curr ? { ...curr, ...data } : null);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    isLoading,
    register,
    login,
    logout,
    resetPassword,
    updateUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
