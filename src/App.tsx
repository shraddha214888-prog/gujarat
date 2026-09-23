import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Gujarat3DMap } from './components/Gujarat3DMap';
import { ExplorerSidebar } from './components/ExplorerSidebar';
import { DetailModal } from './components/DetailModal';
import { CompareModal } from './components/CompareModal';
import { StateInfoModal } from './components/StateInfoModal';
import { GujaratQuizModal } from './components/GujaratQuizModal';
import { CategoryGridView } from './components/CategoryGridView';
import { River, Mountain, City, CategoryType } from './types/gujarat';
import { GUJARAT_RIVERS, GUJARAT_MOUNTAINS, GUJARAT_CITIES } from './data/gujaratData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'rivers' | 'mountains' | 'cities' | 'quiz' | 'stateInfo'>('map');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Selected item states
  const [selectedRiver, setSelectedRiver] = useState<River | null>(null);
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Modals state
  const [detailModalItem, setDetailModalItem] = useState<{
    item: River | Mountain | City;
    type: 'river' | 'mountain' | 'city';
  } | null>(null);

  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareInitialType, setCompareInitialType] = useState<'river' | 'mountain' | 'city'>('river');
  const [isStateInfoOpen, setIsStateInfoOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Audio State & Web Audio Oscillator for subtle traditional Tanpura ambient drone
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Audio toggle handler
  const handleToggleAudio = () => {
    if (isAudioMuted) {
      // Start calm meditative Indian Sa-Pa drone (D-A: 146.8Hz / 220Hz)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;

        // Base Drone (D)
        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(146.83, ctx.currentTime);
        osc1.connect(gainNode);
        osc1.start();
        osc1Ref.current = osc1;

        // Pa (Fifth: A)
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(220.0, ctx.currentTime);
        osc2.connect(gainNode);
        osc2.start();
        osc2Ref.current = osc2;

        setIsAudioMuted(false);
      } catch (e) {
        console.error('Audio start error:', e);
      }
    } else {
      // Stop drone
      if (osc1Ref.current) {
        osc1Ref.current.stop();
        osc1Ref.current.disconnect();
      }
      if (osc2Ref.current) {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      setIsAudioMuted(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Selection handlers
  const handleSelectRiver = (river: River) => {
    setSelectedRiver(river);
    setSelectedMountain(null);
    setSelectedCity(null);
    setDetailModalItem({ item: river, type: 'river' });
  };

  const handleSelectMountain = (mountain: Mountain) => {
    setSelectedMountain(mountain);
    setSelectedRiver(null);
    setSelectedCity(null);
    setDetailModalItem({ item: mountain, type: 'mountain' });
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setSelectedRiver(null);
    setSelectedMountain(null);
    setDetailModalItem({ item: city, type: 'city' });
  };

  const handleViewOn3DMap = (item: River | Mountain | City) => {
    setActiveTab('map');
    if ('lengthKm' in item) {
      setSelectedRiver(item as River);
      setSelectedMountain(null);
      setSelectedCity(null);
    } else if ('heightM' in item) {
      setSelectedMountain(item as Mountain);
      setSelectedRiver(null);
      setSelectedCity(null);
    } else {
      setSelectedCity(item as City);
      setSelectedRiver(null);
      setSelectedMountain(null);
    }
  };

  const handleOpenCompare = (type?: 'river' | 'mountain' | 'city') => {
    if (type) setCompareInitialType(type);
    setIsCompareOpen(true);
  };

  const handleSelectGenericItem = (item: River | Mountain | City, type: 'river' | 'mountain' | 'city') => {
    if (type === 'river') handleSelectRiver(item as River);
    else if (type === 'mountain') handleSelectMountain(item as Mountain);
    else handleSelectCity(item as City);
  };

  const activeSelectedId =
    selectedRiver?.id || selectedMountain?.id || selectedCity?.id || null;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* 3-Zone Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'quiz') {
            setIsQuizOpen(true);
          } else if (tab === 'stateInfo') {
            setIsStateInfoOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenCompare={() => handleOpenCompare('river')}
        onOpenStateInfo={() => setIsStateInfoOpen(true)}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
      />

      {/* Main View Area */}
      <main className="relative flex-1 w-full h-[calc(100vh-61px)] overflow-hidden flex">
        {/* 3D Map View */}
        {activeTab === 'map' && (
          <div className="relative w-full h-full flex">
            {/* 3D WebGL Canvas */}
            <Gujarat3DMap
              categoryFilter={categoryFilter}
              selectedRiver={selectedRiver}
              selectedMountain={selectedMountain}
              selectedCity={selectedCity}
              onSelectRiver={handleSelectRiver}
              onSelectMountain={handleSelectMountain}
              onSelectCity={handleSelectCity}
              searchQuery={searchQuery}
            />

            {/* Slide-out Item Explorer Sidebar */}
            <ExplorerSidebar
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSelectRiver={handleSelectRiver}
              onSelectMountain={handleSelectMountain}
              onSelectCity={handleSelectCity}
              selectedId={activeSelectedId}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
            />
          </div>
        )}

        {/* Rivers Gallery & Data View */}
        {activeTab === 'rivers' && (
          <CategoryGridView
            type="rivers"
            onSelectItem={handleSelectGenericItem}
            onViewOn3DMap={handleViewOn3DMap}
            onOpenCompare={() => handleOpenCompare('river')}
          />
        )}

        {/* Mountains Gallery & Data View */}
        {activeTab === 'mountains' && (
          <CategoryGridView
            type="mountains"
            onSelectItem={handleSelectGenericItem}
            onViewOn3DMap={handleViewOn3DMap}
            onOpenCompare={() => handleOpenCompare('mountain')}
          />
        )}

        {/* Cities Gallery & Data View */}
        {activeTab === 'cities' && (
          <CategoryGridView
            type="cities"
            onSelectItem={handleSelectGenericItem}
            onViewOn3DMap={handleViewOn3DMap}
            onOpenCompare={() => handleOpenCompare('city')}
          />
        )}
      </main>

      {/* Modals */}
      {/* 1. Item Detail Modal */}
      {detailModalItem && (
        <DetailModal
          item={detailModalItem.item}
          type={detailModalItem.type}
          onClose={() => setDetailModalItem(null)}
          onAddToCompare={(item, type) => {
            setDetailModalItem(null);
            handleOpenCompare(type);
          }}
        />
      )}

      {/* 2. Compare Modal */}
      {isCompareOpen && (
        <CompareModal
          initialType={compareInitialType}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {/* 3. State Info Dossier Modal */}
      {isStateInfoOpen && (
        <StateInfoModal onClose={() => setIsStateInfoOpen(false)} />
      )}

      {/* 4. Quiz Modal */}
      {isQuizOpen && (
        <GujaratQuizModal onClose={() => setIsQuizOpen(false)} />
      )}
    </div>
  );
}
