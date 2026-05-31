/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Coins,
  BarChart3,
  Plus,
  Minus,
  LogOut,
  Calendar,
  User,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Smartphone,
  PhoneCall,
  RefreshCw,
  Users,
  Target,
  ChevronRight,
  Calculator,
  Trash2,
  LayoutDashboard,
  Star,
  Phone,
  Undo2,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

import { ProductInfo, SaleRecord, PrepagoRecord, UserProfile, MonthlyHistoryRecord } from './types';
import PercentageCircle from './components/PercentageCircle';
import TrendTimeline from './components/TrendTimeline';
import AuditTrail from './components/AuditTrail';
import CommissionSimulator from './components/CommissionSimulator';
import InputSummaryDashboard from './components/InputSummaryDashboard';
import metaWomLogo from './assets/images/meta_wom_logo_1779833677117.png';

const PRODUCTS: ProductInfo[] = [
  {
    id: 'postpago',
    name: 'Porta Postpago',
    points: 16,
    iconName: 'Smartphone',
    description: 'Portabilidad Postpago línea móvil'
  },
  {
    id: 'porta_pos_15990',
    name: 'Porta pos -$15.990',
    points: 15,
    iconName: 'Smartphone',
    description: 'Portabilidad Postpago plan desde $15.990'
  },
  {
    id: 'porta',
    name: 'Porta Prepago',
    points: 9,
    iconName: 'PhoneCall',
    description: 'Portabilidad Prepago línea móvil anterior'
  },
  {
    id: 'nuevo',
    name: 'Plan Nuevo',
    points: 3,
    iconName: 'Zap',
    description: 'Línea o plan nuevo incorporado'
  },
  {
    id: 'renov',
    name: 'Renovación',
    points: 3,
    iconName: 'RefreshCw',
    description: 'Renovación de planes actuales (sube a 5 pts al llegar al 95% de la meta)'
  }
];

export default function App() {
  // Session states
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [savedUsersList, setSavedUsersList] = useState<string[]>([]);
  const [savedProfilesMap, setSavedProfilesMap] = useState<Record<string, { username: string; isCloud: boolean }>>({});
  const [newUsernameInput, setNewUsernameInput] = useState<string>('');
  
  // App navigation tab
  const [activeTab, setActiveTab] = useState<'panel' | 'prepago' | 'proyeccion' | 'dashboard' | 'comision'>('panel');

  // Input quantities for registering a sale session
  const [tempCounts, setTempCounts] = useState<{
    postpago: number;
    porta_pos_15990: number;
    porta: number;
    nuevo: number;
    renov: number;
  }>({
    postpago: 0,
    porta_pos_15990: 0,
    porta: 0,
    nuevo: 0,
    renov: 0
  });

  // Current active profile data
  const [metaObjective, setMetaObjective] = useState<number>(300);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [lastAddedRecordId, setLastAddedRecordId] = useState<string | null>(null);

  // Prepago target & history
  const [metaPrepagoObjective, setMetaPrepagoObjective] = useState<number>(30);
  const [prepagosHistory, setPrepagosHistory] = useState<PrepagoRecord[]>([]);

  // Monthly History & Current Month selection
  const getInitialMonthName = () => {
    const d = new Date();
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };
  const [currentMonth, setCurrentMonth] = useState<string>(getInitialMonthName());
  const [monthlyHistory, setMonthlyHistory] = useState<MonthlyHistoryRecord[]>([]);

  // Dynamic live clock for modern smartphone simulator UI
  const [statusBarTime, setStatusBarTime] = useState<string>('12:00');
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setStatusBarTime(d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sleek confirmation modal state that works flawlessly in sandboxed browser iframes
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
  });

  const triggerConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Sí, eliminar',
    cancelText = 'Cancelar'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // On mount: fetch existing local profiles, active session, and cloud profiles
  useEffect(() => {
    // 1. Gather local users
    const localUsers: string[] = [];
    const localKeys: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('metaWom_salesData_')) {
        const cleanKey = key.replace('metaWom_salesData_', '');
        localUsers.push(cleanKey);
        const guessName = cleanKey
          .split('_')
          .map((sub) => sub.charAt(0).toUpperCase() + sub.slice(1))
          .join(' ');
        localKeys[cleanKey] = guessName;
      }
    }

    const initialMap: Record<string, { username: string; isCloud: boolean }> = {};
    localUsers.forEach(k => {
      initialMap[k] = { username: localKeys[k], isCloud: false };
    });

    setSavedProfilesMap(initialMap);
    setSavedUsersList(localUsers);

    // Retrieve active session
    const savedSession = localStorage.getItem('metaWom_activeUser');
    if (savedSession) {
      setCurrentUser(savedSession);
    }

    // 2. Fetch all profiles from cloud Firestore
    const fetchCloudProfiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'userProfiles'));
        const updatedMap: Record<string, { username: string; isCloud: boolean }> = { ...initialMap };
        const updatedList = [...localUsers];

        querySnapshot.forEach((docSnap) => {
          const docId = docSnap.id;
          const data = docSnap.data();
          const username = data.username || docId;

          updatedMap[docId] = { username, isCloud: true };
          if (!updatedList.includes(docId)) {
            updatedList.push(docId);
          } else {
            updatedMap[docId].isCloud = true;
          }
        });

        setSavedProfilesMap(updatedMap);
        setSavedUsersList(updatedList);
      } catch (err) {
        console.warn("Could not retrieve cloud user list on startup:", err);
      }
    };

    fetchCloudProfiles();
  }, [currentUser]);

  // Sync profile data dynamically with Firebase Firestore in real-time!
  useEffect(() => {
    if (!currentUser) return;

    const userKey = currentUser.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    
    // Connect to doc ref
    const docRef = doc(db, 'userProfiles', userKey);
    
    // Subscribe to Firestore changes in real-time
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.metaObjective !== undefined) {
          setMetaObjective(data.metaObjective);
        }
        if (data.metaPrepagoObjective !== undefined) {
          setMetaPrepagoObjective(data.metaPrepagoObjective);
        } else {
          setMetaPrepagoObjective(30);
        }
        if (data.salesHistory !== undefined) {
          // Normalize entries when displaying
          const normHistory = (data.salesHistory as any[]).map(r => ({
            ...r,
            portaPre8Count: r.portaPre8Count || 0,
            portaPos15990Count: r.portaPos15990Count || 0
          }));
          setSalesHistory(normHistory);
        }
        if (data.prepagosHistory !== undefined) {
          setPrepagosHistory(data.prepagosHistory);
        } else {
          setPrepagosHistory([]);
        }
        if (data.monthlyHistory !== undefined) {
          setMonthlyHistory(data.monthlyHistory);
        } else {
          setMonthlyHistory([]);
        }
      } else {
        // Fallback or read localStorage first to see if we can seed Firestore
        const stored = localStorage.getItem(`metaWom_salesData_${userKey}`);
        let initialMeta = 300;
        let initialHistory: SaleRecord[] = [];
        let initialPrepagoMeta = 30;
        let initialPrepagoHistory: PrepagoRecord[] = [];
        let initialMonthlyHistory: MonthlyHistoryRecord[] = [];
        
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as any;
            initialMeta = parsed.meta || 300;
            if (parsed.accHistory) {
              initialHistory = parsed.accHistory;
            }
            if (parsed.metaPrepago) {
              initialPrepagoMeta = parsed.metaPrepago;
            }
            if (parsed.prepagosHistory) {
              initialPrepagoHistory = parsed.prepagosHistory;
            }
            if (parsed.monthlyHistory) {
              initialMonthlyHistory = parsed.monthlyHistory;
            }
          } catch (e) {
            // keep defaults
          }
        }
        
        setMetaObjective(initialMeta);
        setSalesHistory(initialHistory);
        setMetaPrepagoObjective(initialPrepagoMeta);
        setPrepagosHistory(initialPrepagoHistory);
        setMonthlyHistory(initialMonthlyHistory);
 
        // Seed document to Firestore
        setDoc(docRef, {
          username: currentUser,
          metaObjective: initialMeta,
          salesHistory: initialHistory,
          metaPrepagoObjective: initialPrepagoMeta,
          prepagosHistory: initialPrepagoHistory,
          monthlyHistory: initialMonthlyHistory
        }).catch((err) => {
          console.error("Error setting initial document:", err);
          handleFirestoreError(err, OperationType.CREATE, `userProfiles/${userKey}`);
        });
      }
    }, (error) => {
      console.error("Error onSnapshot:", error);
      handleFirestoreError(error, OperationType.GET, `userProfiles/${userKey}`);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Save current profile changes to Firestore (and local fallback)
  const saveUserData = async (
    updatedHistory: SaleRecord[],
    updatedMeta: number,
    updatedPrepagoHistory?: PrepagoRecord[],
    updatedPrepagoMeta?: number,
    updatedMonthlyHistory?: MonthlyHistoryRecord[]
  ) => {
    if (!currentUser) return;
    const userKey = currentUser.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    
    const targetPrepagoHistory = updatedPrepagoHistory !== undefined ? updatedPrepagoHistory : prepagosHistory;
    const targetPrepagoMeta = updatedPrepagoMeta !== undefined ? updatedPrepagoMeta : metaPrepagoObjective;
    const targetMonthlyHistory = updatedMonthlyHistory !== undefined ? updatedMonthlyHistory : monthlyHistory;

    // Ensure local synchronization always succeeds first
    localStorage.setItem(
      `metaWom_salesData_${userKey}`,
      JSON.stringify({
        meta: updatedMeta,
        accHistory: updatedHistory,
        metaPrepago: targetPrepagoMeta,
        prepagosHistory: targetPrepagoHistory,
        monthlyHistory: targetMonthlyHistory
      })
    );

    // Save to Firestore for real-time synchronization on other devices
    try {
      const docRef = doc(db, 'userProfiles', userKey);
      await setDoc(docRef, {
        username: currentUser,
        metaObjective: updatedMeta,
        salesHistory: updatedHistory,
        metaPrepagoObjective: targetPrepagoMeta,
        prepagosHistory: targetPrepagoHistory,
        monthlyHistory: targetMonthlyHistory
      });
    } catch (err) {
      console.error("Firestore update failed:", err);
      handleFirestoreError(err, OperationType.WRITE, `userProfiles/${userKey}`);
    }
  };

  // Log in a brand new user or switch profile
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = newUsernameInput.trim();
    if (!cleanInput) return;

    // Capitalize first name character beautifully
    const formattedName = cleanInput
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    localStorage.setItem('metaWom_activeUser', formattedName);
    setCurrentUser(formattedName);

    // Add to local user list if missing
    const userKey = formattedName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    if (!savedUsersList.includes(userKey)) {
      setSavedUsersList((prev) => [...prev, userKey]);
    }
    
    setNewUsernameInput('');
  };

  const handleSelectSavedUser = (userKey: string) => {
    // Attempt to use mapped username from savedProfilesMap (Firestore and local merged map)
    const profile = savedProfilesMap[userKey];
    if (profile) {
      localStorage.setItem('metaWom_activeUser', profile.username);
      setCurrentUser(profile.username);
      return;
    }

    // Fallback search in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === `metaWom_salesData_${userKey}`) {
        const restoredName = userKey
          .split('_')
          .map((sub) => sub.charAt(0).toUpperCase() + sub.slice(1))
          .join(' ');

        localStorage.setItem('metaWom_activeUser', restoredName);
        setCurrentUser(restoredName);
        return;
      }
    }
    // Fallback absolute guess
    const guessName = userKey
      .split('_')
      .map((sub) => sub.charAt(0).toUpperCase() + sub.slice(1))
      .join(' ');
    localStorage.setItem('metaWom_activeUser', guessName);
    setCurrentUser(guessName);
  };

  const handleLogout = () => {
    localStorage.removeItem('metaWom_activeUser');
    setCurrentUser(null);
  };

  // Delete profile completely
  const handleDeleteProfile = (userKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerConfirm(
      '¿Eliminar perfil?',
      '¿Estás seguro de que deseas eliminar este perfil, incluyendo todo su historial de ventas y configuración?',
      () => {
        localStorage.removeItem(`metaWom_salesData_${userKey}`);
        setSavedUsersList((prev) => prev.filter((u) => u !== userKey));
        if (currentUser && currentUser.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase() === userKey) {
          handleLogout();
        }
      },
      'Eliminar',
      'Cancelar'
    );
  };

  // Increments / Decrements current step
  const handleStepCount = (field: 'postpago' | 'porta_pos_15990' | 'porta' | 'nuevo' | 'renov', step: number) => {
    setTempCounts((prev) => ({
      ...prev,
      [field]: Math.max(0, (prev[field] || 0) + step)
    }));
  };

  // Register temp inputs into persistent log history
  const handleRegisterAndClear = () => {
    const isEmp = 
      tempCounts.postpago === 0 &&
      (tempCounts.porta_pos_15990 || 0) === 0 &&
      tempCounts.porta === 0 &&
      tempCounts.nuevo === 0 &&
      tempCounts.renov === 0;

    if (isEmp) {
      alert('Por favor agrega al menos una venta para poder registrar.');
      return;
    }

    const pointsEarned =
      tempCounts.postpago * 16 +
      (tempCounts.porta_pos_15990 || 0) * 15 +
      tempCounts.porta * 9 +
      tempCounts.nuevo * 3 +
      tempCounts.renov * 3;

    const newRecord: SaleRecord = {
      id: 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      postpagoCount: tempCounts.postpago,
      portaCount: tempCounts.porta,
      portaPre8Count: 0,
      portaPos15990Count: tempCounts.porta_pos_15990 || 0,
      nuevoCount: tempCounts.nuevo,
      renovCount: tempCounts.renov,
      pointsEarned
    };

    const nextHistory = [newRecord, ...salesHistory];
    setSalesHistory(nextHistory);
    setLastAddedRecordId(newRecord.id);
    saveUserData(nextHistory, metaObjective);

    // Clear temp states
    setTempCounts({
      postpago: 0,
      porta_pos_15990: 0,
      porta: 0,
      nuevo: 0,
      renov: 0
    });
  };

  // Reverts the last registered entry, restoring its counts to temp state for correction
  const handleUndoRegister = () => {
    if (!lastAddedRecordId) return;
    const recordToUndo = salesHistory.find((r) => r.id === lastAddedRecordId);
    if (!recordToUndo) return;

    setTempCounts({
      postpago: recordToUndo.postpagoCount,
      porta_pos_15990: recordToUndo.portaPos15990Count || 0,
      porta: recordToUndo.portaCount,
      nuevo: recordToUndo.nuevoCount,
      renov: recordToUndo.renovCount,
    });

    const nextHistory = salesHistory.filter((r) => r.id !== lastAddedRecordId);
    setSalesHistory(nextHistory);
    saveUserData(nextHistory, metaObjective);
    setLastAddedRecordId(null);
  };

  // Delete dynamic record from listing
  const handleDeleteRecord = (recordId: string) => {
    triggerConfirm(
      '¿Anular registro de venta?',
      '¿Estás seguro de que deseas anular esta venta registrada? Sus puntos se descontarán del total acumulado.',
      () => {
        const nextHistory = salesHistory.filter((r) => r.id !== recordId);
        setSalesHistory(nextHistory);
        if (lastAddedRecordId === recordId) {
          setLastAddedRecordId(null);
        }
        saveUserData(nextHistory, metaObjective);
      },
      'Anular venta',
      'Mantener'
    );
  };

  // Full History reset
  const handleFullReset = () => {
    triggerConfirm(
      '¿Reiniciar todo el mes?',
      '¿Estás completamente seguro de que deseas limpiar TODAS las ventas registradas? Esto reiniciará todos tus indicadores y puntos a cero de manera irreversible.',
      () => {
        setSalesHistory([]);
        saveUserData([], metaObjective);
      },
      'Reiniciar todo',
      'Cancelar'
    );
  };

  // Update Meta Target target value
  const handleUpdateMeta = (val: number) => {
    const cleanMeta = Math.max(1, val);
    setMetaObjective(cleanMeta);
    saveUserData(salesHistory, cleanMeta);
  };

  // --- PREPAGO HANDLERS ---
  const handleRegisterPrepago = (type: 'activo' | 'cargado') => {
    const pts = type === 'activo' ? 1 : 3;
    const newRecord: PrepagoRecord = {
      id: 'prepago_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      type,
      pointsEarned: pts
    };

    const nextHistory = [newRecord, ...prepagosHistory];
    setPrepagosHistory(nextHistory);
    saveUserData(salesHistory, metaObjective, nextHistory, metaPrepagoObjective);
  };

  const handleDeletePrepago = (id: string) => {
    triggerConfirm(
      '¿Anular registro de prepago?',
      '¿Estás seguro de que deseas anular este registro de prepago?',
      () => {
        const nextHistory = prepagosHistory.filter((r) => r.id !== id);
        setPrepagosHistory(nextHistory);
        saveUserData(salesHistory, metaObjective, nextHistory, metaPrepagoObjective);
      },
      'Anular prepago',
      'Mantener'
    );
  };

  const handleUpdatePrepagoMeta = (val: number) => {
    const cleanMeta = Math.max(1, val);
    setMetaPrepagoObjective(cleanMeta);
    saveUserData(salesHistory, metaObjective, prepagosHistory, cleanMeta);
  };

  const handleFullResetPrepagos = () => {
    triggerConfirm(
      '¿Limpiar todos los prepagos?',
      '¿Estás seguro de que deseas limpiar todos los prepagos registrados en la bitácora?',
      () => {
        setPrepagosHistory([]);
        saveUserData(salesHistory, metaObjective, [], metaPrepagoObjective);
      },
      'Limpiar todo',
      'Cancelar'
    );
  };

  // --- MONTHLY HISTORY HANDLERS ---
  const handleSaveMonthlyHistory = (newRecord: MonthlyHistoryRecord) => {
    const exists = monthlyHistory.some(r => r.monthName.toLowerCase() === newRecord.monthName.toLowerCase());
    let nextHistory = [...monthlyHistory];
    if (exists) {
      nextHistory = monthlyHistory.filter(r => r.monthName.toLowerCase() !== newRecord.monthName.toLowerCase());
    }
    nextHistory = [newRecord, ...nextHistory];
    setMonthlyHistory(nextHistory);
    saveUserData(salesHistory, metaObjective, prepagosHistory, metaPrepagoObjective, nextHistory);
  };

  const handleDeleteMonthlyHistory = (id: string) => {
    triggerConfirm(
      '¿Eliminar registro histórico?',
      '¿Estás seguro de que deseas eliminar este registro mensual del historial?',
      () => {
        const nextHistory = monthlyHistory.filter(r => r.id !== id);
        setMonthlyHistory(nextHistory);
        saveUserData(salesHistory, metaObjective, prepagosHistory, metaPrepagoObjective, nextHistory);
      },
      'Sí, eliminar',
      'Cancelar'
    );
  };

  // --- STATS COMPUTATION ENGINE ---
  const rawTotals = salesHistory.reduce(
    (acc, item) => {
      acc.postpago += item.postpagoCount || 0;
      acc.porta_pos_15990 += item.portaPos15990Count || 0;
      acc.porta += item.portaCount || 0;
      acc.portaPre8 += item.portaPre8Count || 0;
      acc.nuevo += item.nuevoCount || 0;
      acc.renov += item.renovCount || 0;
      return acc;
    },
    { postpago: 0, porta_pos_15990: 0, porta: 0, portaPre8: 0, nuevo: 0, renov: 0 }
  );

  // Base points with Renovación = 3 points
  const basePointsWithoutBonus =
    rawTotals.postpago * 16 +
    rawTotals.porta_pos_15990 * 15 +
    rawTotals.porta * 9 +
    rawTotals.portaPre8 * 8 +
    rawTotals.nuevo * 3 +
    rawTotals.renov * 3;

  // dynamic Renovación upgrade to 5 points upon reaching 95% of goal
  const isRenovationBonusActive = basePointsWithoutBonus >= (metaObjective * 0.95);
  const renovPointsValue = isRenovationBonusActive ? 5 : 3;

  // Total points generated
  const finalPoints =
    rawTotals.postpago * 16 +
    rawTotals.porta_pos_15990 * 15 +
    rawTotals.porta * 9 +
    rawTotals.portaPre8 * 8 +
    rawTotals.nuevo * 3 +
    rawTotals.renov * renovPointsValue;

  const totals = {
    postpago: rawTotals.postpago,
    porta_pos_15990: rawTotals.porta_pos_15990,
    porta: rawTotals.porta,
    portaPre8: rawTotals.portaPre8,
    nuevo: rawTotals.nuevo,
    renov: rawTotals.renov,
    points: finalPoints,
    isBonusActive: isRenovationBonusActive
  };

  // Map history dynamically for display
  const salesHistoryWithDynamicPoints = salesHistory.map((record) => {
    const recRenovPts = isRenovationBonusActive ? 5 : 3;
    const recPts =
      record.postpagoCount * 16 +
      (record.portaPos15990Count || 0) * 15 +
      record.portaCount * 9 +
      (record.portaPre8Count || 0) * 8 +
      record.nuevoCount * 3 +
      record.renovCount * recRenovPts;

    return {
      ...record,
      pointsEarned: recPts,
      renovationBonusApplied: isRenovationBonusActive && record.renovCount > 0
    };
  });

  const currentFulfillmentPercent = (totals.points / metaObjective) * 100;

  // --- PREPAGO STATS ENVIRONMENT ---
  const prepagosTotals = prepagosHistory.reduce(
    (acc, item) => {
      if (item.type === 'activo') {
        acc.activos += 1;
        acc.points += 1;
      } else if (item.type === 'cargado') {
        acc.cargados += 1;
        acc.points += 3;
      }
      return acc;
    },
    { activos: 0, cargados: 0, points: 0 }
  );

  const prepagoFulfillmentPercent = (prepagosTotals.points / metaPrepagoObjective) * 100;

  // Projection Calculations (Hardcoded fixed month bounds 1 to 30)
  const today = new Date();
  const currentDayNum = Math.min(today.getDate(), 30);
  const daysInMonth = 30;
  const daysRemaining = Math.max(0, 30 - currentDayNum);

  const pointsDailyRhythm = totals.points / Math.max(1, currentDayNum);
  const projectedFinalPoints = Math.round(pointsDailyRhythm * 30);
  const projectedFulfillmentPercent = (projectedFinalPoints / metaObjective) * 100;

  const pointsRemainingToTarget = Math.max(0, metaObjective - totals.points);
  const dailyPointsNeeded = daysRemaining > 0 ? (pointsRemainingToTarget / daysRemaining).toFixed(1) : '0.0';

  // Strategy & advise calculation block
  const getProductIcon = (id: string) => {
    switch (id) {
      case 'postpago':
        return <Smartphone className="w-5 h-5 text-wom-magenta" />;
      case 'porta_pos_15990':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'porta':
        return <PhoneCall className="w-5 h-5 text-purple-600" />;
      case 'nuevo':
        return <Zap className="w-5 h-5 text-blue-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-amber-500" />;
    }
  };

  const getProductColorBorder = (id: string) => {
    switch (id) {
      case 'postpago':
        return 'border-l-4 border-l-wom-magenta';
      case 'porta_pos_15990':
        return 'border-l-4 border-l-emerald-500';
      case 'porta':
        return 'border-l-4 border-l-purple-600';
      case 'nuevo':
        return 'border-l-4 border-l-blue-400';
      default:
        return 'border-l-4 border-l-amber-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 md:p-6">
      {/* Outer framing centered like a high contrast native telephone workspace */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl bg-white min-h-screen md:my-4 md:min-h-[850px] md:max-h-[950px] lg:min-h-[880px] lg:max-h-[960px] md:rounded-3xl shadow-sm flex flex-col overflow-x-hidden border border-slate-100 relative">
        
        <AnimatePresence mode="wait">
          {!currentUser ? (
            /* --- LOGIN / WELCOME PROFILE SCREEN --- */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col justify-between p-8 py-16"
            >
              <div className="space-y-6 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                {/* Brand Logo Banner */}
                <div className="text-center space-y-3">
                  <img 
                    src={metaWomLogo} 
                    alt="Meta WOM Logo" 
                    className="w-16 h-16 mx-auto rounded-2xl border border-slate-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <h1 className="text-2xl font-light tracking-tight text-slate-800">
                    META<span className="font-semibold text-indigo-650"> WOM</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Asistente de Metas y Comisiones
                  </p>
                </div>

                {/* Form layout */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-slate-450 uppercase tracking-wider block px-0.5">
                        Tu Nombre o Apodo
                      </label>
                      <input
                        id="loginUsername"
                        type="text"
                        required
                        placeholder="Ej: usuario"
                        value={newUsernameInput}
                        onChange={(e) => setNewUsernameInput(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-slate-800 placeholder-slate-400 font-medium text-sm rounded-xl p-3 border border-slate-200 focus:border-slate-450 focus:outline-none transition-colors"
                      />
                    </div>

                    <button
                      id="submitLogin"
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors text-xs uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Ingresar al Sistema</span>
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          ) : (
            /* --- IN-APP ACTIVE SCREEN --- */
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* Profile Header */}
              <header className="bg-white border-b border-slate-100 p-4 shrink-0 flex flex-col items-center justify-center space-y-2 sm:flex-row sm:space-y-0 sm:justify-between z-30">
                <div className="flex flex-col items-center text-center space-y-1 sm:flex-row sm:space-y-0 sm:space-x-3 sm:text-left">
                  <img 
                    src={metaWomLogo} 
                    alt="Logo" 
                    className="w-8 h-8 rounded-lg border border-slate-100 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col items-center sm:items-start select-none">
                    <h1 className="text-lg font-light tracking-tight text-slate-850">
                      META<span className="font-semibold text-indigo-600"> WOM</span>
                    </h1>
                  </div>
                </div>

                {/* Profile Widget switcher */}
                <div className="flex items-center space-x-2 bg-slate-50 py-1 pl-3 pr-1 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-medium text-slate-600 truncate max-w-[80px]">
                    {currentUser}
                  </span>
                  <button
                    id="btnLogout"
                    onClick={handleLogout}
                    className="p-1 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent"
                    title="Cerrar sesión"
                  >
                    <span className="text-[10px] font-medium uppercase font-sans">Salir</span>
                  </button>
                </div>
              </header>

              {/* Navigation Tabs bar */}
              <nav className="grid grid-cols-5 bg-white sticky top-0 z-25 border-b border-slate-100 shrink-0 select-none">
                <button
                  id="tab-btn-panel"
                  onClick={() => setActiveTab('panel')}
                  className={`py-3 sm:py-4 text-[8px] sm:text-[10px] md:text-[11px] font-medium tracking-wide uppercase transition-all flex flex-col items-center justify-center space-y-1 ${
                    activeTab === 'panel'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                  <span className="truncate w-full text-center px-0.5">Pospago</span>
                </button>
                <button
                  id="tab-btn-prepago"
                  onClick={() => setActiveTab('prepago')}
                  className={`py-3 sm:py-4 text-[8px] sm:text-[10px] md:text-[11px] font-medium tracking-wide uppercase transition-all flex flex-col items-center justify-center space-y-1 ${
                    activeTab === 'prepago'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                  <span className="truncate w-full text-center px-0.5">Prepagos</span>
                </button>
                <button
                  id="tab-btn-proyeccion"
                  onClick={() => setActiveTab('proyeccion')}
                  className={`py-3 sm:py-4 text-[8px] sm:text-[10px] md:text-[11px] font-medium tracking-wide uppercase transition-all flex flex-col items-center justify-center space-y-1 ${
                    activeTab === 'proyeccion'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                  <span className="truncate w-full text-center px-0.5">Proyección</span>
                </button>
                <button
                  id="tab-btn-dashboard"
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-3 sm:py-4 text-[8px] sm:text-[10px] md:text-[11px] font-medium tracking-wide uppercase transition-all flex flex-col items-center justify-center space-y-1 ${
                    activeTab === 'dashboard'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                  <span className="truncate w-full text-center px-0.5 flex items-center justify-center">Control</span>
                </button>
                <button
                  id="tab-btn-comision"
                  onClick={() => setActiveTab('comision')}
                  className={`py-3 sm:py-4 text-[8px] sm:text-[10px] md:text-[11px] font-medium tracking-wide uppercase transition-all flex flex-col items-center justify-center space-y-1 ${
                    activeTab === 'comision'
                      ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                      : 'text-slate-400 hover:text-slate-650'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                  <span className="truncate w-full text-center px-0.5">Comisión</span>
                </button>
              </nav>

              {/* Scrollable Contents viewport */}
              <main className="flex-1 overflow-y-auto p-4 space-y-5 pb-8">
                
                {/* Active Tab rendering */}
                <AnimatePresence mode="wait">
                  {activeTab === 'panel' && (
                    <motion.div
                      key="panelTab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start"
                    >
                      {/* Left Column: Target selectors & Sale entries */}
                                     {/* Meta Goal Objective Box */}
                        <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-slate-400" />
                            <div>
                              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                                Meta de Ventas
                              </h3>
                              <p className="text-[10px] text-slate-400 font-normal">
                                Objetivo mensual exigido
                              </p>
                            </div>
                          </div>

                          {/* Interactive Meta selector */}
                          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                            <input
                              id="fieldMetaGoal"
                              type="number"
                              min="1"
                              value={metaObjective}
                              onChange={(e) => handleUpdateMeta(parseInt(e.target.value) || 1)}
                              className="bg-transparent text-slate-800 font-semibold text-right w-12 focus:outline-none text-xs"
                            />
                            <span className="text-slate-400 font-medium text-[10px] ml-1">
                              PTS
                            </span>
                          </div>
                        </section>

                        {/* Main gauge section */}
                        <PercentageCircle 
                          percentage={currentFulfillmentPercent} 
                          points={totals.points} 
                          meta={metaObjective} 
                        />

                        {/* Sales items register panel */}
                        <section className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                Registrar Ventas
                              </h2>
                              <p className="text-[10px] text-slate-400">
                                Agrega productos y presiona registrar
                              </p>
                            </div>
                            <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                              Hoy
                            </span>
                          </div>

                          {/* Step items stack as smaller grid cards */}
                          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-1.5 animate-fadeIn">
                            {PRODUCTS.map((prod) => (
                              <div 
                                key={prod.id} 
                                className="flex flex-col justify-between p-1.5 bg-slate-50/50 border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-slate-50/70 transition-colors"
                              >
                                {/* Product Info above buttons */}
                                <div className="flex flex-col items-center text-center space-y-1 pb-1 pt-0.5">
                                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                    {getProductIcon(prod.id)}
                                  </div>
                                  <div className="space-y-0.5 flex flex-col justify-center items-center">
                                    <p className="text-[10px] font-medium text-slate-700 leading-tight max-h-[26px] line-clamp-2 px-0.5 overflow-hidden text-center min-h-[24px] flex items-center justify-center">
                                      {prod.name}
                                    </p>
                                    <p className="text-[9px] font-semibold text-indigo-600 leading-none">
                                      +{prod.points} PTS
                                    </p>
                                  </div>
                                  {prod.id === 'renov' && (
                                    <span style={{ fontSize: '7px' }} className="font-medium text-amber-800 bg-amber-50/90 py-0.5 px-1 rounded border border-amber-100 leading-none truncate max-w-full block mt-0.5">
                                      {isRenovationBonusActive ? 'Bono Activo' : '+5 PTS (≥95%)'}
                                    </span>
                                  )}
                                </div>

                                {/* Clickable controls below the info */}
                                <div className="flex items-center justify-between bg-white rounded-lg p-0.5 border border-slate-200/50 mt-1">
                                  <button
                                    id={`step-down-${prod.id}`}
                                    onClick={() => handleStepCount(prod.id as any, -1)}
                                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer transition-colors"
                                  >
                                    <Minus className="w-2 h-2" />
                                  </button>
                                  
                                  <span className="text-[11px] font-semibold text-slate-800 min-w-[12px] text-center select-none">
                                    {tempCounts[prod.id as keyof typeof tempCounts] || 0}
                                  </span>

                                  <button
                                    id={`step-up-${prod.id}`}
                                    onClick={() => handleStepCount(prod.id as any, 1)}
                                    className="w-5 h-5 rounded bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white font-bold flex items-center justify-center cursor-pointer transition-colors"
                                  >
                                    <Plus className="w-2 h-2" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              id="submitRegisterSales"
                              onClick={handleRegisterAndClear}
                              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-3 rounded-xl transition-colors text-xs uppercase tracking-wide flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Registrar</span>
                            </button>

                            {lastAddedRecordId && salesHistory.some(r => r.id === lastAddedRecordId) && (
                              <button
                                id="undoRegisterSales"
                                onClick={handleUndoRegister}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-2.5 px-3 rounded-xl transition-colors text-xs uppercase flex items-center justify-center space-x-1 border border-slate-200 cursor-pointer"
                                title="Deshacer el último ingreso"
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                                <span>Deshacer</span>
                              </button>
                            )}
                          </div>
                        </section>
                      {/* Right Column: Statistics tracker, Trend details & logs */}
                      <div className="space-y-4">
                        {/* Cumulative stats tracker */}
                        <section className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Acumulado Mensual
                          </h3>
                          <button
                            id="btnFullReset"
                            onClick={handleFullReset}
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50/50 text-[10px] font-medium px-2 py-1 rounded transition-colors uppercase tracking-wider cursor-pointer"
                          >
                            Reiniciar
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                            <p className="text-slate-400 font-medium uppercase truncate">Porta Pos</p>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">{totals.postpago}</p>
                          </div>
                          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                            <p className="text-slate-400 font-medium uppercase truncate">@15.990</p>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">{totals.porta_pos_15990}</p>
                          </div>
                          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                            <p className="text-slate-400 font-medium uppercase truncate">Porta Pre</p>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">{totals.porta}</p>
                          </div>
                          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                            <p className="text-slate-400 font-medium uppercase truncate">Nuevo</p>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">{totals.nuevo}</p>
                          </div>
                          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                            <p className="text-slate-400 font-medium uppercase truncate">Renov.</p>
                            <p className="text-xs font-semibold text-slate-800 mt-0.5">{totals.renov}</p>
                          </div>
                          {totals.portaPre8 > 0 && (
                            <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                              <p className="text-slate-400 font-medium uppercase truncate">Pre 8</p>
                              <p className="text-xs font-semibold text-slate-800 mt-0.5">{totals.portaPre8}</p>
                            </div>
                          )}
                        </div>

                        {isRenovationBonusActive && (
                          <div className="bg-amber-50/60 border border-amber-100 text-amber-800 rounded-lg p-2 text-[10px] font-medium text-center flex items-center justify-center">
                            <span>Bono activo: Renovaciones valen 5 Puntos.</span>
                          </div>
                        )}
                      </section>

                      {/* Timeline expected position check */}
                      <TrendTimeline points={totals.points} meta={metaObjective} />

                      {/* Log history list with deletion capability */}
                      <AuditTrail history={salesHistoryWithDynamicPoints} onDeleteRecord={handleDeleteRecord} />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'proyeccion' && (
                    <motion.div
                      key="proyeccionTab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start"
                    >
                      {/* Left Column: Closure Tendency & Rhythm Metrics */}
                      <div className="space-y-4">
                        {/* Close Projections summary info */}
                      <section className="bg-white p-5 rounded-2xl border border-slate-100 overflow-hidden relative">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                          Tendencia de Cierre Estimada
                        </h3>
                        <div className="grid grid-cols-2 gap-6 relative">
                          <div className="text-center border-r border-slate-100">
                            <p className="text-3xl font-light text-slate-800">
                              {projectedFinalPoints}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                              Puntos Finales Est.
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-3xl font-light text-indigo-600">
                              {projectedFulfillmentPercent.toFixed(1)}%
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                              Avance Proyectado
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* Simple Rhythm Indicators */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-center">
                          <p className="text-xl font-semibold text-slate-800">
                            {pointsDailyRhythm.toFixed(1)}
                          </p>
                          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                            Puntos por Día
                          </p>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-center">
                          <p className="text-xl font-semibold text-slate-800">
                            {daysRemaining}
                          </p>
                          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                            Días Restantes
                          </p>
                        </div>
                      </div>
                      </div>

                      {/* Right Column: Dynamic Targets Advisory, Speeds and Strategic Advice */}
                      <div className="space-y-4">
                        {/* Advisory of single-product totals required for 100% */}
                        <section className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3.5">
                        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                          <Sparkles className="w-4 h-4 text-slate-400" />
                          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                            Para alcanzar el 100% necesitas
                          </h3>
                        </div>

                        {pointsRemainingToTarget === 0 ? (
                          <div className="bg-emerald-50/40 border border-emerald-100/60 text-emerald-800 p-4 rounded-xl text-center text-xs space-y-1">
                            <p className="font-semibold">🎉 Meta Cumplida</p>
                            <p className="font-normal opacity-85 text-[11px]">Ya has superado el objetivo general de tu cuota.</p>
                          </div>
                        ) : (
                          <>
                            <p className="text-[11px] text-slate-505">
                              Te faltan <strong>{pointsRemainingToTarget} puntos</strong>. Si se cubrieran con una sola línea de negocio, necesitarías:
                            </p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {PRODUCTS.map((prod) => {
                                const countRequired = Math.ceil(pointsRemainingToTarget / prod.points);
                                return (
                                  <div 
                                    key={prod.id} 
                                    className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/65 flex items-center justify-between"
                                  >
                                    <div className="flex items-center space-x-2">
                                      {getProductIcon(prod.id)}
                                      <span className="text-[10px] font-medium text-slate-500 uppercase">
                                        {prod.id === 'postpago' ? 'Porta Pos' : prod.id === 'porta_pos_15990' ? 'Porta $15.990' : prod.id === 'porta' ? 'Porta Pre' : prod.id === 'nuevo' ? 'Plan Nuevo' : 'Renov.'}
                                      </span>
                                    </div>
                                    <span className="text-xs font-semibold text-indigo-600">
                                      {countRequired}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </section>

                      {/* Velocity and pace warnings based on fulfillment projections */}
                      <section className={`p-4 rounded-xl text-center space-y-1 border ${
                        projectedFulfillmentPercent >= 100
                          ? 'bg-emerald-50/40 border-emerald-100/60 text-emerald-800'
                          : projectedFulfillmentPercent >= 70
                          ? 'bg-indigo-50/40 border-indigo-100/60 text-indigo-800'
                          : 'bg-rose-50/40 border-rose-100/60 text-rose-800'
                      }`}>
                        <p className="text-xs font-semibold uppercase tracking-wider">
                          {projectedFulfillmentPercent >= 100
                            ? 'Ritmo Óptimo'
                            : projectedFulfillmentPercent >= 70
                            ? 'Tramo de Comisión'
                            : 'Ritmo Insuficiente'}
                        </p>
                        <p className="text-[11px] font-normal opacity-90 leading-tight">
                          {projectedFulfillmentPercent >= 100
                            ? 'Lograrás tu cuota si sostienes la velocidad de ventas.'
                            : projectedFulfillmentPercent >= 70
                            ? 'Estás en tramo de cobro básico pero debajo del 100%.'
                            : 'Peligro: Proyectas quedar fuera de la zona de comisamiento.'}
                        </p>
                      </section>

                      {/* Strategic custom advice box */}
                      <section className="bg-white p-5 rounded-2xl border border-slate-100 space-y-2">
                        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                          Estrategia Recomendada
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {projectedFulfillmentPercent >= 100 ? (
                            <span>
                              ¡Sigue así! Para afianzar tus incentivos comerciales y evitar retrocesos en tu panel, enfoca tus energías en robustecer la calidad de las portabilidades <strong>Postpago (+16 pts)</strong> y mantener activas las <strong>Renovaciones (+3 pts)</strong>.
                            </span>
                          ) : projectedFulfillmentPercent >= 70 ? (
                            <span>
                              Has desbloqueado el tramo base. Si deseas alcanzar el incentivo completo de tu meta, necesitas elevar tu promedio de ventas a <strong className="font-semibold text-indigo-601">{dailyPointsNeeded} puntos por día</strong> hasta el final del ciclo.
                            </span>
                          ) : (
                            <span>
                              Acción comercial prioritaria: Sugerimos activar campañas breves orientadas a portabilidad <strong>Prepago (+9 pts)</strong> o concretar dos portabilidades <strong>Postpago (+16 pts)</strong> diarias para forzar la entrada a la zona de cobro. ¡Aún restan {daysRemaining} días hábiles!
                            </span>
                          )}
                        </p>
                      </section>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'prepago' && (
                    <motion.div
                      key="prepagoTab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start"
                    >
                      {/* Left Column: Register & Goals */}
                      <div className="space-y-4">
                        {/* Prepago Actions Card */}
                      <section className="bg-white p-5 rounded-2xl border border-slate-100 space-y-4">
                        <div>
                          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Registrar Prepago
                          </h2>
                          <p className="text-[10px] text-slate-400">
                            Presiona para ingresar de inmediato un prepago activo o cargado:
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            id="register-prepago-activo"
                            onClick={() => handleRegisterPrepago('activo')}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-3 rounded-xl transition-colors cursor-pointer text-xs text-center flex flex-col items-center justify-center space-y-0.5"
                          >
                            <span className="text-xs font-medium">📱 Prepago Activo</span>
                            <span className="text-[9px] text-slate-400 font-normal">+1 Punto</span>
                          </button>
                          
                          <button
                            id="register-prepago-cargado"
                            onClick={() => handleRegisterPrepago('cargado')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-3 rounded-xl transition-colors cursor-pointer text-xs text-center flex flex-col items-center justify-center space-y-0.5"
                          >
                            <span className="text-xs font-medium">💰 Fue Cargado</span>
                            <span className="text-[9px] text-indigo-200 font-normal">+3 Puntos</span>
                          </button>
                        </div>
                      </section>

                      {/* Meta Prepago target input */}
                      <section className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-slate-400">
                            <Target className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                              Meta Prepago Exigida
                            </h3>
                            <p className="text-[10px] text-slate-400">
                              Objetivo mensual Prepago
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                          <input
                            id="fieldMetaPrepago"
                            type="number"
                            min="1"
                            value={metaPrepagoObjective}
                            onChange={(e) => handleUpdatePrepagoMeta(parseInt(e.target.value) || 1)}
                            className="bg-transparent text-slate-800 font-semibold text-right w-12 focus:outline-none text-xs"
                          />
                          <span className="text-slate-400 font-medium text-[10px] ml-1">
                            PTS
                          </span>
                        </div>
                      </section>

                      {/* Prepago Circular Gauge */}
                      <PercentageCircle 
                        percentage={prepagoFulfillmentPercent} 
                        points={prepagosTotals.points} 
                        meta={metaPrepagoObjective} 
                      />
                      </div>

                      {/* Right Column: Accumulated Totals & Records historical tracker */}
                      <div className="space-y-4">
                        {/* Accumulated Prepagos */}
                        <section className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Totales Prepago
                          </h3>
                          <button
                            id="btnResetPrepagos"
                            onClick={handleFullResetPrepagos}
                            className="text-rose-500 hover:text-rose-600 text-[10px] font-medium uppercase tracking-wider cursor-pointer transition-colors"
                          >
                            Limpiar Prepagos
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                            <span className="block text-[10px] text-slate-400 font-medium uppercase truncate">Activos</span>
                            <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{prepagosTotals.activos}</span>
                          </div>
                          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                            <span className="block text-[10px] text-slate-400 font-medium uppercase truncate">Cargados</span>
                            <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{prepagosTotals.cargados}</span>
                          </div>
                          <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100/60">
                            <span className="block text-[10px] text-slate-400 font-medium uppercase truncate font-semibold">Total Pts</span>
                            <span className="font-semibold text-indigo-600 text-xs mt-0.5 block">{prepagosTotals.points}</span>
                          </div>
                        </div>
                      </section>

                      {/* Prepago Historical Records */}
                      <section className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">
                          Historial Prepago del Mes
                        </h4>

                        {prepagosHistory.length === 0 ? (
                          <p className="text-center text-[10.5px] text-slate-400 py-6 italic">
                            No hay prepagos registrados en este mes.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {prepagosHistory.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl transition-all border-l-2 border-l-emerald-500"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                      {item.type === 'activo' ? '📱 Prepago Activo (+1 Pt)' : '💰 Prepago Cargado (+3 Pts)'}
                                    </p>
                                    <p className="text-[10px] font-mono text-slate-400">
                                      {new Date(item.timestamp).toLocaleString('es-CL', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: 'short'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeletePrepago(item.id)}
                                  className="p-1 hover:bg-rose-50 text-slate-350 hover:text-rose-500 rounded transition-colors cursor-pointer"
                                  title="Borrar registro"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'dashboard' && (
                    <motion.div
                      key="dashboardTab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <InputSummaryDashboard
                        currentFulfillmentPercent={currentFulfillmentPercent}
                        prepagoFulfillmentPercent={prepagoFulfillmentPercent}
                        totals={totals}
                        prepagosTotals={prepagosTotals}
                        metaObjective={metaObjective}
                        metaPrepagoObjective={metaPrepagoObjective}
                        currentMonth={currentMonth}
                        currentUser={currentUser}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'comision' && (
                    <motion.div
                      key="comisionTab"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <CommissionSimulator 
                        currentPercentage={currentFulfillmentPercent} 
                        prepagoPercentage={prepagoFulfillmentPercent}
                        currentUser={currentUser}
                        totals={totals}
                        prepagosTotals={prepagosTotals}
                        metaObjective={metaObjective}
                        metaPrepagoObjective={metaPrepagoObjective}
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        monthlyHistory={monthlyHistory}
                        onSaveMonthlyHistory={handleSaveMonthlyHistory}
                        onDeleteMonthlyHistory={handleDeleteMonthlyHistory}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

              </main>

              {/* Bottom informational date label */}
              <footer className="bg-white border-t border-purple-50 px-4 py-3 flex items-center justify-between text-gray-400 font-bold text-[9px] uppercase tracking-wider shrink-0 select-none z-10">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Día {currentDayNum} de {daysInMonth}</span>
                </div>
                <div className="text-wom-magenta font-extrabold">
                  {daysRemaining === 0 ? '¡CIERRE HOY!' : `Cierre en ${daysRemaining} días`}
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Modal */}
        <AnimatePresence>
          {confirmModal.isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              />

              {/* Modal Body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="relative bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-purple-50 text-center space-y-4 z-10"
              >
                <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-gray-500 px-2 leading-relaxed">
                    {confirmModal.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                    className="bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-gray-500 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer select-none"
                  >
                    {confirmModal.cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={confirmModal.onConfirm}
                    className="bg-gradient-to-tr from-rose-500 to-rose-600 hover:brightness-105 hover:shadow-md text-white font-black py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer select-none"
                  >
                    {confirmModal.confirmText}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
