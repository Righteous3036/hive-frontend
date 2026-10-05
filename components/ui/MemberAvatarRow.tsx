import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import { Radii, Spacing } from '../../constants/theme';

export interface MemberItem {
  id: string | number;
  name: string;
  avatarUrl?: string;
  ringColor?: string;
  isOnline?: boolean;
}

const DEFAULT_MEMBERS: MemberItem[] = [
  {
    id: 'm1',
    name: 'Alex Rivera',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    ringColor: '#F59E0B', // Amber
    isOnline: true,
  },
  {
    id: 'm2',
    name: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ringColor: '#10B981', // Emerald
    isOnline: true,
  },
  {
    id: 'm3',
    name: 'Marcus Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    ringColor: '#8B5CF6', // Purple
    isOnline: true,
  },
  {
    id: 'm4',
    name: 'Zendaya Davis',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    ringColor: '#FF6B6B', // Coral
    isOnline: true,
  },
  {
    id: 'm5',
    name: 'Liam Taylor',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ringColor: '#38BDF8', // Cyan / Sky
    isOnline: true,
  },
  {
    id: 'm6',
    name: 'David Miller',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    ringColor: '#10B981', // Green
    isOnline: true,
  },
];

interface AvatarItemProps {
  member: MemberItem;
}

function AvatarBubble({ member }: AvatarItemProps) {
  const { theme } = useTheme();

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <View
      style={styles.avatarContainer}
      accessibilityRole="image"
      accessibilityLabel={`${member.name}, ${member.isOnline ? 'Online' : 'Offline'}`}
    >
      {/* Ring wrapper */}
      <View
        style={[
          styles.ringWrapper,
          { borderColor: member.ringColor || theme.primary },
        ]}
      >
        {member.avatarUrl ? (
          <Image source={{ uri: member.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              { backgroundColor: member.ringColor || theme.card },
            ]}
          >
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
        )}
      </View>

      {/* Online Indicator Dot */}
      {member.isOnline !== false && (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: theme.onlineGreen || '#10B981',
              borderColor: theme.solidBg || '#0B0F19',
            },
          ]}
        />
      )}
    </View>
  );
}

interface MemberAvatarRowProps {
  members?: MemberItem[];
  onlineCount?: number;
  title?: string;
}

export default function MemberAvatarRow({
  members = DEFAULT_MEMBERS,
  onlineCount,
  title = 'Members',
}: MemberAvatarRowProps) {
  const { theme, fontSizes } = useTheme();

  // Exclusively filter and display users who are currently active or online
  const onlineMembers = members.filter((m) => m.isOnline === true);
  const count = onlineCount !== undefined ? onlineCount : onlineMembers.length;

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithCount}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text, fontSize: fontSizes.md + 1 },
            ]}
          >
            {title}{' '}
            <Text style={{ color: theme.textSecondary, fontWeight: '400' }}>
              ({onlineMembers.length})
            </Text>
          </Text>
        </View>

        <View style={styles.onlineBadge}>
          <View
            style={[
              styles.miniOnlineDot,
              { backgroundColor: theme.onlineGreen || '#10B981' },
            ]}
          />
          <Text
            style={[
              styles.onlineText,
              { color: theme.amber || '#F59E0B', fontSize: fontSizes.xs },
            ]}
          >
            Online ({count})
          </Text>
        </View>
      </View>

      {/* Horizontal Avatar List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {onlineMembers.map((member) => (
          <AvatarBubble
            key={member.id}
            member={member}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniOnlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineText: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
});
