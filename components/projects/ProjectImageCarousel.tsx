import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ProjectImageCarouselProps {
  images: string[];
  theme: any;
}

const ProjectImageCarousel: React.FC<ProjectImageCarouselProps> = ({ 
  images, 
  theme 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;
  
  // Navegar entre imagens
  const handleNextImage = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };
  
  const handlePrevImage = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };
  
  if (images.length === 0) {
    return (
      <View style={[styles.noImageContainer, { backgroundColor: theme.colors.border }]}>
        <Text style={[styles.noImageText, { color: theme.colors.text.secondary }]}>
          Sem imagens disponíveis
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: images[currentIndex] }}
        style={[styles.image, { width: screenWidth }]}
        resizeMode="cover"
      />
      
      {images.length > 1 && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: `${theme.colors.background}CC` }]}
            onPress={handlePrevImage}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
              ←
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.counter, { backgroundColor: `${theme.colors.background}CC` }]}>
            <Text style={[styles.counterText, { color: theme.colors.text.primary }]}>
              {currentIndex + 1}/{images.length}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: `${theme.colors.background}CC` }]}
            onPress={handleNextImage}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
              →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 250,
  },
  image: {
    height: 250,
  },
  controls: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    bottom: 16,
    left: 16,
    right: 16,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  counter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noImageContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default ProjectImageCarousel;