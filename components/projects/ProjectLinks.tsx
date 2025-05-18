import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../ui/Button';

interface ProjectLinksProps {
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  onOpenUrl: (url: string) => void;
  onOpenVideo: (url: string) => void;
}

const ProjectLinks: React.FC<ProjectLinksProps> = ({
  repoUrl,
  demoUrl,
  videoUrl,
  githubUrl,
  linkedinUrl,
  onOpenUrl,
  onOpenVideo,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.mainLinks}>
        {demoUrl && (
          <Button
            title="Ver Demo"
            variant="outline"
            size="sm"
            onPress={() => onOpenUrl(demoUrl)}
            style={styles.linkButton}
          />
        )}
        
        {repoUrl && (
          <Button
            title="Repositório"
            variant="outline"
            size="sm"
            onPress={() => onOpenUrl(repoUrl)}
            style={styles.linkButton}
          />
        )}
        
        {videoUrl && (
          <Button
            title="Ver Vídeo"
            variant="outline"
            size="sm"
            onPress={() => onOpenVideo(videoUrl)}
            style={styles.linkButton}
          />
        )}
      </View>
      
      <View style={styles.socialLinks}>
        {githubUrl && (
          <Button
            title="GitHub"
            variant="ghost"
            size="sm"
            onPress={() => onOpenUrl(githubUrl)}
            style={styles.socialButton}
          />
        )}
        
        {linkedinUrl && (
          <Button
            title="LinkedIn"
            variant="ghost"
            size="sm"
            onPress={() => onOpenUrl(linkedinUrl)}
            style={styles.socialButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  mainLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  linkButton: {
    marginRight: 8,
    marginBottom: 8,
    minWidth: 100,
  },
  socialLinks: {
    flexDirection: 'row',
  },
  socialButton: {
    marginRight: 8,
  },
});

export default ProjectLinks;