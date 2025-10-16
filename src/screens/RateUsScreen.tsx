import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants';
import { useUser } from '../contexts/UserContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

interface RateUsScreenProps {
  onBack: () => void;
}

const RateUsScreen: React.FC<RateUsScreenProps> = ({ onBack }) => {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Platform-specific alert function
  const showAlert = (title: string, message: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
      if (buttons && buttons.length > 0) {
        const result = window.confirm(`${title}\n\n${message}`);
        if (result && buttons[0] && buttons[0].onPress) {
          buttons[0].onPress();
        }
      } else {
        alert(`${title}\n\n${message}`);
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showAlert('Please Rate Us', 'Please select a star rating before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare rating data
      const ratingData = {
        userId: user?.phoneNumber || 'anonymous',
        userName: user?.name || user?.profile?.name || 'Anonymous User',
        rating: rating,
        comment: comment.trim() || null,
        timestamp: serverTimestamp(),
        appVersion: '1.0.0', // You can get this from app config
        platform: Platform.OS,
        userAgent: Platform.OS === 'web' ? navigator.userAgent : null,
      };

      // Save to Firebase
      const ratingsRef = collection(db, 'appRatings');
      await addDoc(ratingsRef, ratingData);

      console.log('✅ Rating submitted successfully:', ratingData);

      // Show success message
      showAlert(
        'Thank You!',
        `Thank you for your ${rating}-star rating! Your feedback helps us improve the app.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setRating(0);
              setComment('');
              onBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Failed to submit rating:', error);
      showAlert(
        'Error',
        'Failed to submit your rating. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      // Determine if this star should be highlighted
      const currentRating = hoverRating || rating;
      const isHighlighted = i <= currentRating;
      
      stars.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.starButton,
            hoverRating > 0 && i <= hoverRating && styles.starButtonHover
          ]}
          onPress={() => handleStarPress(i)}
          onPressIn={() => handleStarHover(i)}
          onPressOut={handleStarLeave}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.star,
            isHighlighted ? styles.starFilled : styles.starEmpty,
            hoverRating > 0 && i <= hoverRating && styles.starHover
          ]}>
            ⭐
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    const currentRating = hoverRating || rating;
    switch (currentRating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Rate Our App</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>How would you rate Tuktuk Sports?</Text>
          <Text style={styles.sectionSubtitle}>
            Your feedback helps us improve the app for everyone
          </Text>

          {/* Star Rating */}
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>

          {/* Rating Text */}
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>Tell us more (Optional)</Text>
          <Text style={styles.commentSubtitle}>
            Share your thoughts about the app, what you like, or suggestions for improvement
          </Text>

          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Write your feedback here..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            maxLength={500}
            editable={!isSubmitting}
          />
          <Text style={styles.characterCount}>
            {comment.length}/500 characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            rating === 0 && styles.submitButtonDisabled,
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          <Text style={[
            styles.submitButtonText,
            (rating === 0 || isSubmitting) && styles.submitButtonTextDisabled
          ]}>
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Text>
        </TouchableOpacity>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 Your rating and feedback are anonymous and will only be used to improve our app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    paddingVertical: SIZES.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: SIZES.lg,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
    paddingVertical: SIZES.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  starButton: {
    padding: SIZES.sm,
    marginHorizontal: SIZES.xs,
    borderRadius: SIZES.radius,
    minWidth: 50,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starButtonHover: {
    backgroundColor: COLORS.surface,
    transform: [{ scale: 1.05 }],
  },
  star: {
    fontSize: 40,
  },
  starFilled: {
    // Star is filled by default with ⭐ emoji
  },
  starEmpty: {
    opacity: 0.3,
  },
  starHover: {
    transform: [{ scale: 1.1 }],
    opacity: 0.8,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    textAlign: 'center',
  },
  commentSection: {
    marginBottom: SIZES.xl,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
  },
  commentTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  commentSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SIZES.xs,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  submitButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  privacyNote: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default RateUsScreen;
