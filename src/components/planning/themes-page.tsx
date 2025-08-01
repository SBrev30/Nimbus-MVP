// src/components/planning/themes-page.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Lightbulb, Star, Circle, Edit, Trash2, Users, BookOpen, MapPin } from 'lucide-react';
import { themeService, type Theme, type CreateThemeData, type UpdateThemeData } from '../../services/theme-service';
import { characterService } from '../../services/character-service';
import { plotService } from '../../services/plot-service';
import { worldBuildingService } from '../../services/world-building-service';

const ThemesPage: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'major' | 'minor' | 'motif'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  // Available content for connections
  const [availableCharacters, setAvailableCharacters] = useState<any[]>([]);
  const [availablePlots, setAvailablePlots] = useState<any[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]);

  // Load themes
  const loadThemes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await themeService.getThemes();
      setThemes(data);
      setFilteredThemes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load themes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load available content for connections
  const loadAvailableContent = useCallback(async () => {
    try {
      const [characters, plots, locations] = await Promise.all([
        characterService.getCharacters(),
        plotService.getPlotThreads(),
        worldBuildingService.getWorldElementsByCategory('location')
      ]);
      
      setAvailableCharacters(characters);
      setAvailablePlots(plots);
      setAvailableLocations(locations);
    } catch (err) {
      console.error('Error loading available content:', err);
    }
  }, []);

  // Filter themes
  useEffect(() => {
    let filtered = themes;

    if (selectedType !== 'all') {
      filtered = filtered.filter(theme => theme.theme_type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(theme =>
        theme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredThemes(filtered);
  }, [themes, searchQuery, selectedType]);

  // Load data on mount
  useEffect(() => {
    loadThemes();
    loadAvailableContent();
  }, [loadThemes, loadAvailableContent]);

  // Get theme type icon
  const getThemeIcon = (type: Theme['theme_type']) => {
    switch (type) {
      case 'major': return
