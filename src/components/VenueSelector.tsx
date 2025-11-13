import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLORS, SIZES, FONTS } from '../constants';

export interface Venue {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  area?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
}

interface VenueSelectorProps {
  value?: string;
  onSelect: (venue: Venue | string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean; // Disable when match is started
}

const VenueSelector: React.FC<VenueSelectorProps> = ({
  value = '',
  onSelect,
  placeholder = 'Search for a venue or enter custom venue',
  label = 'Venue',
  required = false,
  error,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Debounce timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Only update searchQuery from value if no venue is selected
    // This prevents clearing the search when a venue is selected
    if (value && value !== searchQuery && !selectedVenue) {
      setSearchQuery(value);
    }
    // If value is cleared externally (e.g., when Remove is clicked), clear selected venue too
    if (!value && selectedVenue) {
      setSelectedVenue(null);
      setSearchQuery('');
    }
  }, [value, selectedVenue]);

  // Search venues from Firestore
  const searchVenues = async (searchText: string) => {
    // Wait for at least 2 characters before searching
    if (!searchText || searchText.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const queryLower = searchText.toLowerCase().trim();
      
      // Search Firestore grounds collection
      // Note: Firestore doesn't support case-insensitive search natively
      // We'll fetch all active grounds and filter client-side
      const groundsRef = collection(db, 'grounds');
      const firestoreQuery = query(
        groundsRef,
        where('isActive', '==', true),
        limit(200) // Limit to 200 results for performance (we'll filter client-side)
      );
      
      const querySnapshot = await getDocs(firestoreQuery);
      const allGrounds: Venue[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as {
          name?: string;
          area?: string;
          type?: string;
          lat?: number;
          lng?: number;
          isActive?: boolean;
        };
        const name = data.name || '';
        const area = data.area || '';
        
        // Client-side filtering: check if query matches name or area
        const nameMatch = name.toLowerCase().includes(queryLower);
        const areaMatch = area.toLowerCase().includes(queryLower);
        
        if (nameMatch || areaMatch) {
          allGrounds.push({
            id: doc.id,
            name: name,
            address: `${area}, Bengaluru`,
            city: 'Bengaluru',
            area: area,
            type: data.type || 'mixed',
            latitude: data.lat || undefined,
            longitude: data.lng || undefined,
          });
        }
      });
      
      // Sort by relevance: exact name matches first, then area matches
      const sortedGrounds = allGrounds.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().startsWith(queryLower);
        const bNameMatch = b.name.toLowerCase().startsWith(queryLower);
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        // Then by name alphabetical
        return a.name.localeCompare(b.name);
      });
      
      setSuggestions(sortedGrounds.slice(0, 20)); // Limit to 20 suggestions
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching venues from Firestore:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    if (disabled) return; // Don't allow search if disabled
    
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce API calls - wait 300ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      searchVenues(text);
    }, 300);
    
    // Show suggestions if text exists
    if (text.length >= 2) {
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectVenue = (venue: Venue) => {
    if (disabled) return; // Don't allow selection if disabled
    
    // Clear search field after selection
    setSearchQuery('');
    setSelectedVenue(venue);
    setShowSuggestions(false);
    onSelect(venue);
    Keyboard.dismiss();
  };

  const handleCustomVenue = () => {
    if (disabled) return; // Don't allow selection if disabled
    
    if (searchQuery.trim()) {
      const customVenue: Venue = {
        name: searchQuery.trim(),
        city: 'Bengaluru',
      };
      // Clear search field after selection
      setSearchQuery('');
      setSelectedVenue(customVenue);
      setShowSuggestions(false);
      onSelect(customVenue);
      Keyboard.dismiss();
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, error && styles.inputError, disabled && styles.inputDisabled]}
          placeholder={disabled ? 'Venue locked (match started)' : placeholder}
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={() => {
            if (!disabled && searchQuery.length >= 2) {
              setShowSuggestions(true);
            }
          }}
          onBlur={handleBlur}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!disabled}
        />
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {suggestions.map((venue, index) => (
              <TouchableOpacity
                key={venue.id || index}
                style={styles.suggestionItem}
                onPress={() => handleSelectVenue(venue)}
              >
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionName}>{venue.name}</Text>
                  {venue.area && (
                    <Text style={styles.suggestionAddress}>
                      📍 {venue.area}, {venue.city || 'Bengaluru'}
                      {venue.type && ` • ${venue.type === 'paid' ? 'Paid' : venue.type === 'free' ? 'Free' : 'Mixed'}`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            {/* Custom venue option */}
            {searchQuery.trim().length >= 2 && (
              <TouchableOpacity
                style={[styles.suggestionItem, styles.customVenueOption]}
                onPress={handleCustomVenue}
              >
                <Text style={styles.customVenueText}>
                  ✓ Use "{searchQuery.trim()}" as custom venue
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {selectedVenue && selectedVenue.address && (
        <View style={styles.selectedVenueInfo}>
          <Text style={styles.selectedVenueText}>
            📍 {selectedVenue.address}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 15,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.error,
  },
  suggestionsContainer: {
    marginTop: 8,
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginBottom: 4,
  },
  suggestionAddress: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  customVenueOption: {
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 0,
  },
  customVenueText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  selectedVenueInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  selectedVenueText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
});

export default VenueSelector;
