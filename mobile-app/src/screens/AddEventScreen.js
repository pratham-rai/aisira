import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Modal, 
  FlatList,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import client from '../api/client';
import Input from '../components/Input';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import { AuthContext } from '../context/AuthContext';

// Exact category names from the website
const EVENT_CATEGORIES = [
  'Yakshagana', 
  'Nema/Kola', 
  'Kambala', 
  'Nataka', 
  'Dance', 
  'Temple Annual Fair', 
  'Other Events'
];

export default function AddEventScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    prasanga: '',
    category: EVENT_CATEGORIES[0],
    troupe: '',
    date: '',
    endDate: '',
    time: '',
    location: '',
    googleMapsLink: '',
    latitude: '',
    longitude: '',
    description: '',
    organizerPhone: '',
    organizerEmail: ''
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolvingMap, setResolvingMap] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // DateTimePicker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [dateValue, setDateValue] = useState(new Date());
  const [endDateValue, setEndDateValue] = useState(new Date());
  const [timeValue, setTimeValue] = useState(new Date());

  // Ask for media permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access media library is required for poster uploads');
      }
    })();
  }, []);

  // Map Link Auto-Resolver (triggered by explicit button tap)
  const handleResolveCoordinates = async () => {
    const url = formData.googleMapsLink.trim();
    if (!url || !url.startsWith('http')) {
      Alert.alert('Invalid Link', 'Please paste a valid Google Maps link starting with http/https.');
      return;
    }

    setResolvingMap(true);
    try {
      const res = await client.post('/events/resolve-map-link', { url });
      if (res.data && res.data.lat && res.data.lng) {
        setFormData(prev => ({
          ...prev,
          latitude: res.data.lat.toString(),
          longitude: res.data.lng.toString()
        }));
        Alert.alert('Auto-Fill Success', 'Coordinates successfully resolved and auto-filled from Google Maps link!');
      } else {
        Alert.alert('Not Found', 'Could not extract coordinates from this Google Maps link. Please enter them manually.');
      }
    } catch (err) {
      console.warn('Could not auto-resolve coordinates:', err);
      Alert.alert('Error', 'Failed to resolve link. Please make sure the link is correct or input coordinates manually.');
    } finally {
      setResolvingMap(false);
    }
  };

  // Image Picker Handler
  const handlePickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload up to 5 poster images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const selected = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || `poster_${Date.now()}.jpg`,
        type: 'image/jpeg'
      }));
      setImages(prev => [...prev, ...selected].slice(0, 5));
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // DateTimePicker Handlers
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateValue(selectedDate);
      const formatted = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: formatted }));
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDateValue(selectedDate);
      const formatted = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, endDate: formatted }));
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTimeValue(selectedTime);
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setFormData(prev => ({ ...prev, time: `${hours}:${minutes}` }));
    }
  };

  // Form Submit Handler
  const handleSubmit = async () => {
    // 1. Validation checks
    if (!formData.prasanga || !formData.date || !formData.time || !formData.location) {
      Alert.alert('Required Fields Missing', 'Please fill all required fields:\n• Event Title\n• Start Date\n• Time\n• Location');
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Enforce future date validation
    if (formData.date < todayStr) {
      Alert.alert('Invalid Date', 'The event date must be today or in the future.');
      return;
    }

    // Enforce future time validation if event is today
    if (formData.date === todayStr) {
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const [selectedHours, selectedMinutes] = formData.time.split(':').map(Number);
      if (selectedHours < currentHours || (selectedHours === currentHours && selectedMinutes < currentMinutes)) {
        Alert.alert('Invalid Time', 'For today\'s events, the selected time must be in the future.');
        return;
      }
    }

    setLoading(true);
    try {
      // 2. Upload images if any selected
      let posterUrls = [];
      if (images.length > 0) {
        const uploadData = new FormData();
        images.forEach(img => {
          uploadData.append('posters', img);
        });

        const uploadRes = await client.post('/upload', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        posterUrls = uploadRes.data.urls || [];
      }

      // 3. Submit the event
      const eventPayload = {
        ...formData,
        posterUrls,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
      };

      await client.post('/events', eventPayload);

      Alert.alert(
        '🎪 Success', 
        'Event submitted successfully! It will be reviewed by an admin before publishing.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to submit event. Please check your inputs.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // If browsing as guest user, show Auth block screen
  if (!user) {
    return (
      <SafeAreaView style={styles.guestContainer} edges={['top']}>
        <GlassCard style={styles.guestCard}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.guestTitle}>Sign In Required</Text>
          <Text style={styles.guestText}>
            You must be logged in to submit an event to the community.
            Submitted shows will be reviewed by our admin panel before going live.
          </Text>
          <Button 
            title="👤 Sign In / Register" 
            onPress={() => navigation.navigate('Profile')}
            style={{ marginTop: 12 }}
          />
        </GlassCard>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.headerEmoji}>🎪</Text>
          <Text style={styles.headerTitle}>Submit an Event</Text>
          <Text style={styles.headerSubtitle}>
            Share a cultural event of Tulunadu with the community. It will be reviewed by an admin before publishing.
          </Text>
        </View>

        <GlassCard style={styles.card}>
          {/* Category Dropdown */}
          <Text style={styles.inputLabel}>Category *</Text>
          <TouchableOpacity 
            style={styles.dropdownBtn}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.dropdownBtnText}>{formData.category}</Text>
            <Text style={{color: theme.colors.textMuted}}>▼</Text>
          </TouchableOpacity>

          <Input 
            label="Event Title (Prasanga) *" 
            value={formData.prasanga}
            onChangeText={(text) => setFormData(prev => ({ ...prev, prasanga: text }))}
            placeholder="e.g. Karna Parva or Tulu Nataka"
          />

          <Input 
            label="Organizer / Troupe / Mela (optional)" 
            value={formData.troupe}
            onChangeText={(text) => setFormData(prev => ({ ...prev, troupe: text }))}
            placeholder="e.g. Dharmasthala Mela or Local Committee"
          />

          {/* Date Selector buttons */}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.inputLabel}>Start Date *</Text>
              <TouchableOpacity 
                style={styles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerBtnText}>
                  {formData.date ? formData.date : 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.inputLabel}>End Date (optional)</Text>
              <TouchableOpacity 
                style={styles.datePickerBtn}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.datePickerBtnText}>
                  {formData.endDate ? formData.endDate : 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Selector button */}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.inputLabel}>Time *</Text>
            <TouchableOpacity 
              style={styles.datePickerBtn}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datePickerBtnText}>
                {formData.time ? formData.time : 'Select Time'}
              </Text>
            </TouchableOpacity>
          </View>

          <Input 
            label="Location *" 
            value={formData.location}
            onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
            placeholder="e.g. Dharmasthala Temple, Dharmasthala"
          />

          {/* Google Maps Link and Manual Resolver Button */}
          <View style={{ marginBottom: 16 }}>
            <Input 
              label="Google Maps Link (optional)" 
              value={formData.googleMapsLink}
              onChangeText={(text) => setFormData(prev => ({ ...prev, googleMapsLink: text }))}
              placeholder="https://maps.google.com/..."
              autoCapitalize="none"
            />
            <TouchableOpacity 
              style={styles.resolveLinkBtn}
              onPress={handleResolveCoordinates}
              disabled={resolvingMap}
            >
              {resolvingMap ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : (
                <Text style={styles.resolveLinkBtnText}>📍 Auto-Fill Coordinates</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Input 
                label="Latitude (optional)" 
                value={formData.latitude}
                onChangeText={(text) => setFormData(prev => ({ ...prev, latitude: text }))}
                placeholder="e.g. 12.9563"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.gridCol}>
              <Input 
                label="Longitude (optional)" 
                value={formData.longitude}
                onChangeText={(text) => setFormData(prev => ({ ...prev, longitude: text }))}
                placeholder="e.g. 75.3724"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input 
            label="Description (optional)" 
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Describe the event..."
            multiline
            numberOfLines={4}
            style={{ height: 90 }}
          />

          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Input 
                label="Organizer Phone (optional)" 
                value={formData.organizerPhone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, organizerPhone: text }))}
                placeholder="e.g. +91 9876543210"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.gridCol}>
              <Input 
                label="Organizer Email (optional)" 
                value={formData.organizerEmail}
                onChangeText={(text) => setFormData(prev => ({ ...prev, organizerEmail: text }))}
                placeholder="e.g. organizer@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Event Poster Uploader */}
          <View style={styles.uploadSection}>
            <Text style={styles.inputLabel}>Event Poster (optional, up to 5 images)</Text>
            
            <TouchableOpacity style={styles.uploadArea} onPress={handlePickImage}>
              <Text style={styles.uploadAreaIcon}>📎</Text>
              <Text style={styles.uploadAreaTitle}>Select Images</Text>
              <Text style={styles.uploadAreaSub}>JPG, PNG, WebP (max 5MB each)</Text>
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewsContainer}>
                {images.map((img, i) => (
                  <View key={i} style={styles.previewBox}>
                    <Image source={{ uri: img.uri }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removePreviewBtn}
                      onPress={() => handleRemoveImage(i)}
                    >
                      <Text style={styles.removePreviewText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <Button 
            title="🎪 Submit Event" 
            onPress={handleSubmit} 
            loading={loading}
            style={{ marginTop: 24 }}
          />
        </GlassCard>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={EVENT_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.categorySelectItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, category: item }));
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.categorySelectItemText, 
                    formData.category === item && styles.categorySelectItemTextActive
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <Button 
              title="Close" 
              variant="secondary" 
              onPress={() => setCategoryModalVisible(false)} 
              style={{ marginTop: 16 }}
            />
          </GlassCard>
        </View>
      </Modal>

      {/* DateTimePickers */}
      {showDatePicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDateValue}
          mode="date"
          display="default"
          minimumDate={formData.date ? new Date(formData.date) : new Date()}
          onChange={onEndDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={timeValue}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  guestCard: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 45, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  guestText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  card: {
    padding: 20,
    backgroundColor: 'rgba(20, 25, 45, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  dropdownBtn: {
    backgroundColor: theme.colors.bgPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerBtn: {
    backgroundColor: theme.colors.bgPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  datePickerBtnText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  resolveLinkBtn: {
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  resolveLinkBtnText: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  gridRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  gridCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  uploadSection: {
    marginTop: 8,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAreaIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  uploadAreaTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  uploadAreaSub: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  previewsContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  previewBox: {
    position: 'relative',
    marginRight: 12,
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewImage: {
    width: 80,
    height: 120,
    resizeMode: 'cover',
  },
  removePreviewBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePreviewText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 24,
    maxHeight: '80%',
    backgroundColor: 'rgba(25, 20, 35, 0.95)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  categorySelectItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categorySelectItemText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  categorySelectItemTextActive: {
    color: theme.colors.accent,
    fontWeight: '700',
  }
});
