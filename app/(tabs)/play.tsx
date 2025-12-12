import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Trophy, TrendingUp, Search, MapPin, X, ChevronRight, Check, Minus, Plus, Users, UserPlus, UserCheck } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { golfCourses, leaderboard } from '@/mocks/golf';
import type { GolfCourse, HoleScore } from '@/mocks/golf';
import { courseService, type VicCourse } from '@/lib/courseService';
import { router, useFocusEffect } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { friends as mockFriends } from '@/mocks/friends';
import { calculateHoleScore, calculateSplit } from '@/lib/scoring';

type Player = {
  id: string;
  name: string;
  avatar?: string;
  isGuest: boolean;
  userId?: string;
};

type ExtendedHoleScore = HoleScore & {
  strokeIndex?: number;
};

type SavedRound = {
  course: GolfCourse;
  holeScores: ExtendedHoleScore[];
  players: Player[];
  totalHoles: 9 | 18;
  timestamp: string;
  vicCourse?: VicCourse;
  selectedTee?: string;
  handicap?: number;
};

export default function PlayScreen() {
  const { user, updateChips } = useApp();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'scorecard'>('leaderboard');
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<GolfCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHoleTracker, setShowHoleTracker] = useState(false);
  const [holeScores, setHoleScores] = useState<ExtendedHoleScore[]>([]);
  const [handicap, setHandicap] = useState<number>(0);
  const [showHandicapInput, setShowHandicapInput] = useState(false);
  const [showHoleSelection, setShowHoleSelection] = useState(false);
  const [totalHoles, setTotalHoles] = useState<9 | 18>(18);
  const [nineHoleType, setNineHoleType] = useState<'front' | 'back'>('front');
  const [showNineHoleType, setShowNineHoleType] = useState(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [guestName, setGuestName] = useState('');
  const [submitButtonLayout, setSubmitButtonLayout] = useState({ x: 0, y: 0 });
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const { firebaseUser } = useFirebase();
  const [vicCourse, setVicCourse] = useState<VicCourse | null>(null);
  const [selectedTee, setSelectedTee] = useState<string>('');

  useEffect(() => {
    loadSavedRound();
  }, []);

  const checkForSelectedCourse = useCallback(() => {
    async function checkCourse() {
      try {
        const lastCourse = await courseService.getLastUsedCourse();
        if (lastCourse) {
          const course = await courseService.getCourseById(lastCourse.courseId);
          if (course) {
            setVicCourse(course);
            setSelectedTee(lastCourse.teeName);
            await courseService.clearLastUsedCourse();

            if (!selectedCourse) {
              setShowHoleSelection(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking for selected course:', error);
      }
    }
    checkCourse();
  }, [selectedCourse]);

  useFocusEffect(checkForSelectedCourse);

  useEffect(() => {
    if (showHoleTracker && holeScores.length > 0 && selectedCourse) {
      saveRoundProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holeScores, showHoleTracker]);

  const loadSavedRound = async () => {
    try {
      const saved = await AsyncStorage.getItem('currentRound');
      if (saved) {
        const round: SavedRound = JSON.parse(saved);
        Alert.alert(
          'Resume Round',
          `You have a saved round at ${round.course.name}. Would you like to continue?`,
          [
            {
              text: 'Start New',
              style: 'destructive',
              onPress: () => {
                AsyncStorage.removeItem('currentRound');
              },
            },
            {
              text: 'Resume',
              onPress: () => {
                setSelectedCourse(round.course);
                setHoleScores(round.holeScores);
                setPlayers(round.players);
                setTotalHoles(round.totalHoles);
                setHandicap(round.handicap || 0);
                if (round.vicCourse) {
                  setVicCourse(round.vicCourse);
                  setSelectedTee(round.selectedTee || '');
                }
                setShowHoleTracker(true);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log('Error loading saved round:', error);
    }
  };

  const saveRoundProgress = async () => {
    if (!selectedCourse) return;
    try {
      const round: SavedRound = {
        course: selectedCourse,
        holeScores,
        players,
        totalHoles,
        timestamp: new Date().toISOString(),
        vicCourse: vicCourse || undefined,
        selectedTee: selectedTee || undefined,
        handicap,
      };
      await AsyncStorage.setItem('currentRound', JSON.stringify(round));
    } catch (error) {
      console.log('Error saving round:', error);
    }
  };

  useEffect(() => {
    if (handicap !== undefined) {
      saveRoundProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handicap]);

  const clearSavedRound = async () => {
    try {
      await AsyncStorage.removeItem('currentRound');
    } catch (error) {
      console.log('Error clearing saved round:', error);
    }
  };

  const filteredCourses = golfCourses.filter(
    course =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCourse = (course: GolfCourse) => {
    setSelectedCourse(course);
    setShowCourseSelector(false);
    setShowHoleSelection(true);
  };

  const handleHoleSelection = (holes: 9 | 18) => {
    setTotalHoles(holes);
    setShowHoleSelection(false);
    if (holes === 9) {
      setShowNineHoleType(true);
    } else {
      setShowPlayerSelection(true);
    }
  };

  const handleNineHoleTypeSelection = (type: 'front' | 'back') => {
    setNineHoleType(type);
    setShowNineHoleType(false);
    setShowPlayerSelection(true);
  };

  const addCurrentUser = () => {
    const currentPlayer: Player = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      isGuest: false,
      userId: firebaseUser?.uid,
    };
    if (!players.find(p => p.id === user.id)) {
      setPlayers([currentPlayer, ...players]);
    }
  };

  const addFriend = (friendId: string) => {
    const friend = mockFriends.find(f => f.id === friendId);
    if (friend && !players.find(p => p.id === friendId)) {
      const friendPlayer: Player = {
        id: friendId,
        name: friend.name,
        avatar: friend.avatar,
        isGuest: false,
        userId: friendId,
      };
      setPlayers([...players, friendPlayer]);
    }
    setShowFriendsModal(false);
  };

  const addGuest = () => {
    if (guestName.trim()) {
      const guest: Player = {
        id: `guest-${Date.now()}`,
        name: guestName.trim(),
        isGuest: true,
      };
      setPlayers([...players, guest]);
      setGuestName('');
    }
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter(p => p.id !== playerId));
  };

  const startRound = () => {
    if (players.length === 0) {
      addCurrentUser();
    }

    setShowPlayerSelection(false);

    // ✅ If a VIC course + tee is selected, use that for the round
    if (vicCourse && selectedTee) {
      const totalPar = courseService.getTotalPar(vicCourse, selectedTee);

      const courseStub: GolfCourse = {
        id: vicCourse.id,
        name: vicCourse.club,
        location: vicCourse.suburb,
        state: vicCourse.state,
        par: totalPar,
        holes: 18,
        rating: 4.5,
        image: '',
      };

      // keep selectedCourse in sync so saving/resuming still works
      setSelectedCourse(courseStub);
      initializeHoleScores(courseStub);
      return;
    }

    // 🟢 Fallback: existing behaviour for mock courses
    if (selectedCourse) {
      initializeHoleScores(selectedCourse);
    }
  };

  const initializeHoleScores = (course: GolfCourse) => {
    const actualHoles = totalHoles;
    const scores: ExtendedHoleScore[] = [];
    const startHole = totalHoles === 9 && nineHoleType === 'back' ? 10 : 1;

    if (vicCourse && selectedTee) {
      const tee = courseService.getTee(vicCourse, selectedTee);
      const pars = tee?.par || [];
      const strokeIndexes = tee?.strokeIndex || [];
      const startIndex = totalHoles === 9 && nineHoleType === 'back' ? 9 : 0;
      const endIndex = totalHoles === 9 ? startIndex + 9 : 18;

      for (let i = startIndex; i < endIndex; i++) {
        scores.push({
          hole: i + 1,
          par: pars[i] || 4,
          score: 0,
          strokeIndex: strokeIndexes[i],
        });
      }
    } else {
      const parPerHole = Math.floor(course.par / actualHoles);
      const remainder = course.par % actualHoles;

      for (let i = 0; i < actualHoles; i++) {
        scores.push({
          hole: startHole + i,
          par: i < remainder ? parPerHole + 1 : parPerHole,
          score: 0,
        });
      }
    }

    setHoleScores(scores);
    setShowHoleTracker(true);
  };

  const updateHoleScore = (holeIndex: number, newScore: number) => {
    const updated = [...holeScores];
    updated[holeIndex] = { ...updated[holeIndex], score: Math.max(0, newScore) };
    setHoleScores(updated);
  };

  const getTotalScore = () => {
    return holeScores.reduce((sum, hole) => sum + hole.score, 0);
  };

  const getScoreToPar = () => {
    const totalPar = holeScores.reduce((sum, hole) => sum + hole.par, 0);
    return getTotalScore() - totalPar;
  };

  const handleSubmitRound = () => {
    console.log('=== Submit Round button pressed ===');
    const totalScore = getTotalScore();
    const completedHoles = holeScores.filter(h => h.score > 0).length;
    
    console.log('Total Score:', totalScore);
    console.log('Completed Holes:', completedHoles);
    console.log('Total Holes:', holeScores.length);
    console.log('Hole Scores:', JSON.stringify(holeScores));
    
    if (completedHoles === 0) {
      console.log('No scores entered, showing alert');
      Alert.alert(
        'No Score',
        'Please enter scores for at least one hole.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
      return;
    }

    const incompletedHoles = holeScores.filter(h => h.score === 0).length;
    console.log('Incomplete holes:', incompletedHoles);
    
    if (incompletedHoles > 0) {
      console.log('Showing incomplete round alert');
      Alert.alert(
        'Incomplete Round',
        `You have ${incompletedHoles} hole(s) without a score. Submit anyway?`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel', 
            onPress: () => console.log('Submit cancelled') 
          },
          { 
            text: 'Submit', 
            onPress: () => {
              console.log('User confirmed submit');
              submitScore(totalScore);
            }
          },
        ],
        { cancelable: true }
      );
    } else {
      console.log('All holes completed, submitting score');
      submitScore(totalScore);
    }
  };

  const submitScore = (totalScore: number) => {
    console.log('=== submitScore called ===');
    console.log('Total Score:', totalScore);
    
    const scoreToPar = getScoreToPar();
    const scoreText = scoreToPar === 0 ? 'Even Par' : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;
    const chipsEarned = 150;
    
    console.log('Score to par:', scoreToPar);
    console.log('Chips earned:', chipsEarned);
    console.log('Updating chips with animation...');
    console.log('Button position:', submitButtonLayout);
    
    const { width, height } = Dimensions.get('window');
    const animationPosition = {
      x: submitButtonLayout.x > 0 ? submitButtonLayout.x + (width / 2) : width / 2,
      y: submitButtonLayout.y > 0 ? submitButtonLayout.y : height - 100,
    };
    
    console.log('Animation position:', animationPosition);
    updateChips(chipsEarned, animationPosition);
    clearSavedRound();
    
    console.log('Showing success alert');
    
    setTimeout(() => {
      Alert.alert(
        'Round Submitted!',
        `Score: ${totalScore} (${scoreText})\n\nYou earned ${chipsEarned} chips! 🎉`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Closing scorecard and resetting state');
              setShowHoleTracker(false);
              setHoleScores([]);
              setSelectedCourse(null);
              setPlayers([]);
              setTotalHoles(18);
            },
          },
        ],
        { cancelable: false }
      );
    }, 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Trophy
            size={20}
            color={activeTab === 'leaderboard' ? Colors.gold : Colors.textSecondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}
          >
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scorecard' && styles.activeTab]}
          onPress={() => setActiveTab('scorecard')}
        >
          <TrendingUp
            size={20}
            color={activeTab === 'scorecard' ? Colors.gold : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'scorecard' && styles.activeTabText]}>
            Scorecard
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'leaderboard' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardTitle}>Top Players This Month</Text>
            <Text style={styles.leaderboardSubtitle}>
              Compete for chips and exclusive badges
            </Text>
          </View>

          {leaderboard.map((entry, index) => (
            <View
              key={entry.userId}
              style={[
                styles.leaderboardCard,
                index < 3 && styles.topThreeCard,
              ]}
            >
              <View style={styles.rankContainer}>
                {index < 3 ? (
                  <View
                    style={[
                      styles.medalBadge,
                      index === 0 && styles.goldMedal,
                      index === 1 && styles.silverMedal,
                      index === 2 && styles.bronzeMedal,
                    ]}
                  >
                    <Trophy
                      size={20}
                      color={
                        index === 0
                          ? Colors.gold
                          : index === 1
                          ? Colors.silver
                          : Colors.bronze
                      }
                    />
                  </View>
                ) : (
                  <Text style={styles.rankText}>{entry.rank}</Text>
                )}
              </View>

              <Image source={{ uri: entry.userAvatar }} style={styles.playerAvatar} />

              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{entry.userName}</Text>
                <View style={styles.courseInfo}>
                  <MapPin size={12} color={Colors.textSecondary} />
                  <Text style={styles.courseText}>{entry.course}</Text>
                </View>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreValueLeaderboard}>{entry.score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>

              <View style={styles.chipsEarned}>
                <Text style={styles.chipsValue}>+{entry.chipsEarned}</Text>
              </View>
            </View>
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.scorecardHeader}>
            <Text style={styles.scorecardTitle}>Start New Round</Text>
            <Text style={styles.scorecardSubtitle}>
              Select a course and track your score
            </Text>
          </View>

          <TouchableOpacity
            style={styles.courseSelector}
            onPress={() => router.push('/scorecard/course-select')}
          >
            {vicCourse && selectedTee ? (
              <View style={styles.selectedCourseInfo}>
                <View>
                  <Text style={styles.selectedCourseName}>{vicCourse.club}</Text>
                  <Text style={styles.selectedCourseLocation}>
                    {vicCourse.suburb}, {vicCourse.state} • {selectedTee}
                  </Text>
                </View>
                <Text style={styles.selectedCoursePar}>Par {courseService.getTotalPar(vicCourse, selectedTee)}</Text>
              </View>
            ) : selectedCourse ? (
              <View style={styles.selectedCourseInfo}>
                <View>
                  <Text style={styles.selectedCourseName}>{selectedCourse.name}</Text>
                  <Text style={styles.selectedCourseLocation}>
                    {selectedCourse.location}, {selectedCourse.state}
                  </Text>
                </View>
                <Text style={styles.selectedCoursePar}>Par {selectedCourse.par}</Text>
              </View>
            ) : (
              <View style={styles.selectCoursePrompt}>
                <MapPin size={24} color={Colors.accent} />
                <Text style={styles.selectCourseText}>Select Golf Course</Text>
              </View>
            )}
          </TouchableOpacity>

          {(selectedCourse || (vicCourse && selectedTee)) && (
            <View style={styles.scorecardContainer}>
              <TouchableOpacity
                style={styles.startRoundButton}
                onPress={() => setShowHoleSelection(true)}
              >
                <View style={styles.startRoundContent}>
                  <View>
                    <Text style={styles.startRoundTitle}>Start New Round</Text>
                    <Text style={styles.startRoundSubtitle}>
                      Select holes and add players
                    </Text>
                  </View>
                  <ChevronRight size={24} color={Colors.white} />
                </View>
              </TouchableOpacity>

              <Text style={styles.infoText}>
                Track your round and earn chips for completing your scorecard!
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      <Modal
        visible={showCourseSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Course</Text>
            <TouchableOpacity onPress={() => setShowCourseSelector(false)}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredCourses}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.courseItem}
                onPress={() => handleSelectCourse(item)}
              >
                <Image source={{ uri: item.image }} style={styles.courseImage} />
                <View style={styles.courseItemInfo}>
                  <Text style={styles.courseItemName}>{item.name}</Text>
                  <Text style={styles.courseItemLocation}>
                    {item.location}, {item.state}
                  </Text>
                  <View style={styles.courseItemDetails}>
                    <Text style={styles.courseItemPar}>Par {item.par}</Text>
                    <Text style={styles.courseItemDivider}>•</Text>
                    <Text style={styles.courseItemHoles}>{item.holes} holes</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      <Modal
        visible={showHoleSelection}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Holes</Text>
            <TouchableOpacity onPress={() => setShowHoleSelection(false)}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.holeSelectionContainer}>
            <Text style={styles.holeSelectionTitle}>How many holes?</Text>
            <View style={styles.holeOptions}>
              <TouchableOpacity
                style={styles.holeOption}
                onPress={() => handleHoleSelection(9)}
              >
                <Text style={styles.holeOptionNumber}>9</Text>
                <Text style={styles.holeOptionLabel}>Holes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.holeOption}
                onPress={() => handleHoleSelection(18)}
              >
                <Text style={styles.holeOptionNumber}>18</Text>
                <Text style={styles.holeOptionLabel}>Holes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showNineHoleType}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select 9 Holes</Text>
            <TouchableOpacity onPress={() => setShowNineHoleType(false)}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.holeSelectionContainer}>
            <Text style={styles.holeSelectionTitle}>Which 9 holes?</Text>
            <View style={styles.holeOptions}>
              <TouchableOpacity
                style={styles.holeOption}
                onPress={() => handleNineHoleTypeSelection('front')}
              >
                <Text style={styles.holeOptionNumber}>Front</Text>
                <Text style={styles.holeOptionLabel}>Holes 1-9</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.holeOption}
                onPress={() => handleNineHoleTypeSelection('back')}
              >
                <Text style={styles.holeOptionNumber}>Back</Text>
                <Text style={styles.holeOptionLabel}>Holes 10-18</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPlayerSelection}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Players</Text>
            <TouchableOpacity onPress={() => setShowPlayerSelection(false)}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.playerSelectionContent}>
            <TouchableOpacity
              style={styles.addPlayerButton}
              onPress={addCurrentUser}
            >
              <Users size={20} color={Colors.gold} />
              <Text style={styles.addPlayerText}>Add Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addFriendButton}
              onPress={() => setShowFriendsModal(true)}
            >
              <UserCheck size={20} color={Colors.gold} />
              <Text style={styles.addPlayerText}>Add Friend from App</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.guestInputContainer}>
              <TextInput
                style={styles.guestInput}
                placeholder="Guest name"
                placeholderTextColor={Colors.textSecondary}
                value={guestName}
                onChangeText={setGuestName}
              />
              <TouchableOpacity
                style={styles.addGuestButton}
                onPress={addGuest}
                disabled={!guestName.trim()}
              >
                <UserPlus size={20} color={guestName.trim() ? Colors.gold : Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {players.length > 0 && (
              <View style={styles.playersList}>
                <Text style={styles.playersListTitle}>Players ({players.length})</Text>
                {players.map(player => (
                  <View key={player.id} style={styles.playerItem}>
                    {player.avatar ? (
                      <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
                    ) : (
                      <View style={styles.playerAvatarPlaceholder}>
                        <Text style={styles.playerAvatarText}>
                          {player.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.playerItemInfo}>
                      <Text style={styles.playerItemName}>{player.name}</Text>
                      {player.isGuest ? (
                        <Text style={styles.playerItemLabel}>Guest</Text>
                      ) : player.userId ? (
                        <Text style={styles.playerItemLabelConnected}>Connected Friend</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity onPress={() => removePlayer(player.id)}>
                      <X size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.playerSelectionFooter}>
            <TouchableOpacity
              style={styles.startRoundButtonModal}
              onPress={startRound}
            >
              <Text style={styles.startRoundButtonText}>Start Round</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showHoleTracker}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.trackerContainer}>
          <View style={styles.trackerHeader}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Exit Round',
                  'Your progress will be saved. You can resume later.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Exit',
                      onPress: () => {
                        setShowHoleTracker(false);
                      },
                    },
                  ]
                );
              }}
            >
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.trackerHeaderInfo}>
              <Text style={styles.trackerCourseName}>
                {vicCourse ? vicCourse.club : selectedCourse?.name}
              </Text>
              <Text style={styles.trackerCourseDetails}>
                {vicCourse && selectedTee ? `${selectedTee} • ` : ''}
                {totalHoles === 9 ? `${nineHoleType === 'front' ? 'Front' : 'Back'} 9` : '18 holes'} • {players.length} player{players.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/scorecard/course-select')}
            >
              <ChevronRight size={24} color={Colors.gold} />
            </TouchableOpacity>
          </View>

          <View style={styles.handicapContainer}>
            <Text style={styles.handicapLabel}>Playing Handicap</Text>
            <View style={styles.handicapInputRow}>
              <TouchableOpacity
                style={styles.handicapButton}
                onPress={() => setHandicap(Math.max(0, handicap - 1))}
              >
                <Minus size={20} color={Colors.gold} />
              </TouchableOpacity>
              <Text style={styles.handicapValue}>{handicap}</Text>
              <TouchableOpacity
                style={styles.handicapButton}
                onPress={() => setHandicap(Math.min(54, handicap + 1))}
              >
                <Plus size={20} color={Colors.gold} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.scoreOverview}>
            <View style={styles.scoreOverviewItem}>
              <Text style={styles.scoreOverviewLabel}>Gross</Text>
              <Text style={styles.scoreOverviewValue}>{getTotalScore()}</Text>
            </View>
            <View style={styles.scoreOverviewDivider} />
            <View style={styles.scoreOverviewItem}>
              <Text style={styles.scoreOverviewLabel}>Net</Text>
              <Text style={[styles.scoreOverviewValue, styles.underPar]}>
                {(() => {
                  const holesData = holeScores.map(h => ({
                    par: h.par,
                    gross: h.score,
                    strokeIndex: h.strokeIndex || 1,
                  }));
                  const totals = calculateSplit(holesData, handicap);
                  return totals.total.netTotal;
                })()}
              </Text>
            </View>
            <View style={styles.scoreOverviewDivider} />
            <View style={styles.scoreOverviewItem}>
              <Text style={styles.scoreOverviewLabel}>Stableford</Text>
              <Text style={[styles.scoreOverviewValue, { color: Colors.gold }]}>
                {(() => {
                  const holesData = holeScores.map(h => ({
                    par: h.par,
                    gross: h.score,
                    strokeIndex: h.strokeIndex || 1,
                  }));
                  const totals = calculateSplit(holesData, handicap);
                  return totals.total.pointsTotal;
                })()}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.holesContainer}
            showsVerticalScrollIndicator={false}
          >
            {holeScores.map((hole, index) => {
              const calc = calculateHoleScore({
                par: hole.par,
                gross: hole.score,
                strokeIndex: hole.strokeIndex || 1,
                handicap,
              });
              const scoreToPar = hole.score > 0 ? hole.score - hole.par : 0;
              return (
                <View key={hole.hole} style={styles.holeCard}>
                  <View style={styles.holeHeader}>
                    <View style={styles.holeNumberContainer}>
                      <Text style={styles.holeNumber}>Hole {hole.hole}</Text>
                      <Text style={styles.holePar}>Par {hole.par}</Text>
                      {hole.strokeIndex && (
                        <View style={styles.strokeIndexBadge}>
                          <Text style={styles.strokeIndexText}>SI {hole.strokeIndex}</Text>
                        </View>
                      )}
                    </View>
                    {hole.score > 0 && calc.points > 0 && (
                      <View
                        style={[
                          styles.holeStatusBadge,
                          calc.points === 2 && styles.parBadge,
                          calc.points > 2 && styles.underParBadge,
                          calc.points < 2 && styles.overParBadge,
                        ]}
                      >
                        <Text style={styles.pointsBadgeText}>{calc.points}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.scoreRow}>
                    <View style={styles.scoreCell}>
                      <Text style={styles.scoreCellLabel}>Gross</Text>
                      <View style={styles.scoreControls}>
                        <TouchableOpacity
                          style={styles.scoreButtonSmall}
                          onPress={() => updateHoleScore(index, hole.score - 1)}
                          disabled={hole.score === 0}
                        >
                          <Minus
                            size={18}
                            color={hole.score === 0 ? Colors.border : Colors.gold}
                          />
                        </TouchableOpacity>
                        <TextInput
                          style={styles.scoreInputField}
                          value={hole.score === 0 ? '' : String(hole.score)}
                          onChangeText={(text) => {
                            if (text === '') {
                              updateHoleScore(index, 0);
                              return;
                            }
                            const num = parseInt(text, 10);
                            if (!isNaN(num) && num >= 0 && num <= 15) {
                              updateHoleScore(index, num);
                            }
                          }}
                          keyboardType="number-pad"
                          placeholder="-"
                          placeholderTextColor={Colors.textSecondary}
                          maxLength={2}
                          returnKeyType="done"
                          editable={true}
                        />
                        <TouchableOpacity
                          style={styles.scoreButtonSmall}
                          onPress={() => updateHoleScore(index, hole.score + 1)}
                        >
                          <Plus size={18} color={Colors.gold} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {hole.strokeIndex && (
                      <>
                        <View style={styles.scoreCell}>
                          <Text style={styles.scoreCellLabel}>Net</Text>
                          <Text style={[styles.scoreValue, calc.net > 0 && styles.underPar]}>
                            {calc.net > 0 ? calc.net : '-'}
                          </Text>
                          {calc.shots > 0 && hole.score > 0 && (
                            <Text style={styles.shotsText}>({calc.shots} shot{calc.shots > 1 ? 's' : ''})</Text>
                          )}
                        </View>

                        <View style={styles.scoreCell}>
                          <Text style={styles.scoreCellLabel}>Points</Text>
                          <Text style={[styles.scoreValue, { color: Colors.gold }]}>
                            {calc.points > 0 ? calc.points : '-'}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              );
            })}

            <View style={styles.bottomSpacer} />
          </ScrollView>

          <View style={styles.trackerFooter}>
            <TouchableOpacity
              style={styles.submitRoundButton}
              onPress={() => {
                console.log('Submit button touched!');
                handleSubmitRound();
              }}
              onLayout={(event) => {
                const { x, y } = event.nativeEvent.layout;
                setSubmitButtonLayout({ x, y });
                console.log('Submit button layout:', { x, y });
              }}
              activeOpacity={0.7}
              testID="submit-round-button"
            >
              <Text style={styles.submitRoundText}>Submit Round</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFriendsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Friend</Text>
            <TouchableOpacity onPress={() => setShowFriendsModal(false)}>
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor={Colors.textSecondary}
              value={friendSearchQuery}
              onChangeText={setFriendSearchQuery}
            />
          </View>

          <FlatList
            data={mockFriends.filter(f => 
              !players.find(p => p.id === f.id) &&
              (f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
               f.username.toLowerCase().includes(friendSearchQuery.toLowerCase()))
            )}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.friendSelectItem}
                onPress={() => addFriend(item.id)}
              >
                <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                <View style={styles.friendItemInfo}>
                  <Text style={styles.friendItemName}>{item.name}</Text>
                  <Text style={styles.friendItemUsername}>{item.username}</Text>
                </View>
                <UserCheck size={20} color={Colors.gold} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyFriendsList}>
                <Text style={styles.emptyFriendsText}>
                  {friendSearchQuery ? 'No friends found' : 'All friends already added'}
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.friendsListContent}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.gold,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.gold,
  },
  content: {
    flex: 1,
  },
  leaderboardHeader: {
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leaderboardTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  topThreeCard: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  medalBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldMedal: {
    backgroundColor: Colors.gold + '20',
  },
  silverMedal: {
    backgroundColor: Colors.silver + '20',
  },
  bronzeMedal: {
    backgroundColor: Colors.bronze + '20',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreValueLeaderboard: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  scoreLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  chipsEarned: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipsValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.success,
  },
  scorecardHeader: {
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scorecardTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  scorecardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  courseSelector: {
    backgroundColor: Colors.cardBackground,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
  },
  selectCoursePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  selectCourseText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  selectedCourseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCourseName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  selectedCourseLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectedCoursePar: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  scorecardContainer: {
    padding: 16,
  },
  scorecardSectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  quickScoreCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickScoreLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  quickScoreInput: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 120,
    marginBottom: 20,
  },
  submitScoreButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitScoreText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardBackground,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  courseItem: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseImage: {
    width: 100,
    height: 100,
    backgroundColor: Colors.lightGray,
  },
  courseItemInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  courseItemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  courseItemLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  courseItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseItemPar: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.gold,
  },
  courseItemDivider: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  courseItemHoles: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 32,
  },
  startRoundButton: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  startRoundContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  startRoundTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.navy,
    marginBottom: 4,
  },
  startRoundSubtitle: {
    fontSize: 14,
    color: Colors.navy,
    opacity: 0.8,
  },
  trackerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trackerHeaderInfo: {
    flex: 1,
    alignItems: 'center',
  },
  trackerCourseName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  trackerCourseDetails: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  scoreOverview: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreOverviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreOverviewLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600' as const,
  },
  scoreOverviewValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scoreOverviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  underPar: {
    color: Colors.success,
  },
  overPar: {
    color: Colors.error,
  },
  holesContainer: {
    flex: 1,
    marginTop: 16,
  },
  holeCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  holeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  holeNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  holeNumber: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  holePar: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  holeStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  parBadge: {
    backgroundColor: Colors.textSecondary,
  },
  underParBadge: {
    backgroundColor: Colors.success,
  },
  overParBadge: {
    backgroundColor: Colors.error,
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreDisplay: {
    alignItems: 'center',
    minWidth: 100,
  },
  scoreDisplayValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scoreDisplayDiff: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  underParText: {
    color: Colors.success,
  },
  overParText: {
    color: Colors.error,
  },
  trackerFooter: {
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  submitRoundButton: {
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitRoundText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  handicapContainer: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  handicapLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  handicapInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  handicapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handicapValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    minWidth: 60,
    textAlign: 'center',
  },
  strokeIndexBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  strokeIndexText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
  },
  scoreCellLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  scoreButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shotsText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scoreInputField: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  holeSelectionContainer: {
    padding: 24,
    alignItems: 'center',
  },
  holeSelectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 32,
  },
  holeOptions: {
    flexDirection: 'row',
    gap: 20,
  },
  holeOption: {
    backgroundColor: Colors.gold,
    width: 140,
    height: 140,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  holeOptionNumber: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.navy,
    marginBottom: 8,
  },
  holeOptionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.navy,
    opacity: 0.8,
  },
  playerSelectionContent: {
    flex: 1,
    padding: 16,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    marginBottom: 16,
  },
  addPlayerText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.gold,
  },
  guestInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  guestInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  addGuestButton: {
    backgroundColor: Colors.cardBackground,
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playersList: {
    marginTop: 8,
  },
  playersListTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  playerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  playerItemInfo: {
    flex: 1,
  },
  playerItemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  playerItemLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  playerSelectionFooter: {
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startRoundButtonModal: {
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  startRoundButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.navy,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  playerItemLabelConnected: {
    fontSize: 13,
    color: Colors.gold,
    marginTop: 2,
  },
  friendSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  friendItemInfo: {
    flex: 1,
  },
  friendItemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  friendItemUsername: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyFriendsList: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFriendsText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  friendsListContent: {
    paddingBottom: 20,
  },
});
