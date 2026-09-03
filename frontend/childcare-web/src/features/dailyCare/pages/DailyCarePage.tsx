import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Divider,
  Chip,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
  Collapse,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add,
  Check,
  Restaurant,
  Hotel,
  WaterDrop,
  LocalActivity,
  Notes,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  AccessTime,
  Pause,
  PlayArrow,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar } from '@/components/common/Avatar';
import { mockChildren } from '@/mock/children';
import { mockRooms } from '@/mock/rooms';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { showSnackbar } from '@/features/auth/uiSlice';
import type { DailyCareRecord, CareType } from '@/types';
import { formatTime, formatDate } from '@/utils/formatters';

const TODAY = new Date().toISOString().split('T')[0];

type MealType = 'BREAKFAST' | 'MORNING_TEA' | 'LUNCH' | 'AFTERNOON_TEA' | 'LATE_SNACK';
type SleepQuality = 'GOOD' | 'AVERAGE' | 'RESTLESS';
type NappyType = 'WET' | 'DRY' | 'SOILED' | 'SUCCESSFUL_TOILET';
type BottleType = 'WATER' | 'MILK' | 'FORMULA';
type LearningArea = 'PHYSICAL' | 'COGNITIVE' | 'SOCIAL_EMOTIONAL' | 'LANGUAGE' | 'CREATIVE';

interface MealEntry {
  meals: MealType[];
  time: string;
  notes: string;
}

interface SleepEntry {
  startTime: string;
  endTime: string;
  inProgress: boolean;
  quality: SleepQuality;
  notes: string;
}

interface NappyEntry {
  type: NappyType;
  time: string;
  notes: string;
}

interface WaterEntry {
  amount: string;
  type: BottleType;
  time: string;
}

interface ActivityEntry {
  name: string;
  learningArea: LearningArea;
  time: string;
}

interface NoteEntry {
  content: string;
  time: string;
}

const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  MORNING_TEA: 'Morning Tea',
  LUNCH: 'Lunch',
  AFTERNOON_TEA: 'Afternoon Tea',
  LATE_SNACK: 'Late Snack',
};

const SLEEP_QUALITY_LABELS: Record<SleepQuality, string> = {
  GOOD: 'Good',
  AVERAGE: 'Average',
  RESTLESS: 'Restless',
};

const NAPPY_LABELS: Record<NappyType, string> = {
  WET: 'Wet',
  DRY: 'Dry',
  SOILED: 'Soiled',
  SUCCESSFUL_TOILET: 'Successful Toilet',
};

const BOTTLE_LABELS: Record<BottleType, string> = {
  WATER: 'Water',
  MILK: 'Milk',
  FORMULA: 'Formula',
};

const LEARNING_AREA_LABELS: Record<LearningArea, string> = {
  PHYSICAL: 'Physical',
  COGNITIVE: 'Cognitive',
  SOCIAL_EMOTIONAL: 'Social & Emotional',
  LANGUAGE: 'Language',
  CREATIVE: 'Creative',
};

const CARE_TABS = [
  { key: 'meals', label: 'Meals', icon: <Restaurant /> },
  { key: 'sleep', label: 'Sleep', icon: <Hotel /> },
  { key: 'nappy', label: 'Nappy/Toilet', icon: <CheckCircle /> },
  { key: 'water', label: 'Water/Bottles', icon: <WaterDrop /> },
  { key: 'activities', label: 'Activities', icon: <LocalActivity /> },
  { key: 'notes', label: 'Notes', icon: <Notes /> },
] as const;

type TabKey = (typeof CARE_TABS)[number]['key'];

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function generateId(): string {
  return `care-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

const emptyMeal: MealEntry = { meals: [], time: getCurrentTime(), notes: '' };
const emptySleep: SleepEntry = { startTime: getCurrentTime(), endTime: '', inProgress: false, quality: 'GOOD', notes: '' };
const emptyNappy: NappyEntry = { type: 'WET', time: getCurrentTime(), notes: '' };
const emptyWater: WaterEntry = { amount: '', type: 'WATER', time: getCurrentTime() };
const emptyActivity: ActivityEntry = { name: '', learningArea: 'PHYSICAL', time: getCurrentTime() };
const emptyNote: NoteEntry = { content: '', time: getCurrentTime() };

function getRoomName(roomId: string): string {
  const room = mockRooms.find((r) => r.id === roomId);
  return room?.name || 'Unknown';
}

function getRoomChildren(roomId: string) {
  return mockChildren.filter((c) => c.roomId === roomId && c.enrolmentStatus === 'ENROLLED');
}

export default function DailyCarePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(mockChildren[0]?.id ?? null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-1');
  const [activeTab, setActiveTab] = useState<TabKey>('meals');
  const [mobileChildSelectorOpen, setMobileChildSelectorOpen] = useState(true);

  const [mealForm, setMealForm] = useState<MealEntry>(emptyMeal);
  const [sleepForm, setSleepForm] = useState<SleepEntry>(emptySleep);
  const [nappyForm, setNappyForm] = useState<NappyEntry>(emptyNappy);
  const [waterForm, setWaterForm] = useState<WaterEntry>(emptyWater);
  const [activityForm, setActivityForm] = useState<ActivityEntry>(emptyActivity);
  const [noteForm, setNoteForm] = useState<NoteEntry>(emptyNote);

  const [records, setRecords] = useState<DailyCareRecord[]>([
    {
      id: 'care-demo-1',
      childId: 'child-1',
      centreId: 'centre-1',
      date: TODAY,
      type: 'MEAL',
      time: '08:30',
      details: JSON.stringify({ meals: ['BREAKFAST'], notes: 'Ate well, finished all porridge' }),
      educatorId: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'care-demo-2',
      childId: 'child-1',
      centreId: 'centre-1',
      date: TODAY,
      type: 'SLEEP',
      time: '12:30',
      endTime: '14:00',
      details: JSON.stringify({ quality: 'GOOD', notes: 'Slept soundly' }),
      educatorId: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'care-demo-3',
      childId: 'child-2',
      centreId: 'centre-1',
      date: TODAY,
      type: 'NAPPY',
      time: '09:15',
      details: JSON.stringify({ type: 'WET', notes: '' }),
      educatorId: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'care-demo-4',
      childId: 'child-3',
      centreId: 'centre-1',
      date: TODAY,
      type: 'WATER',
      time: '10:00',
      details: JSON.stringify({ amount: '120ml', type: 'WATER' }),
      educatorId: 'user-1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'care-demo-5',
      childId: 'child-1',
      centreId: 'centre-1',
      date: TODAY,
      type: 'ACTIVITY',
      time: '10:30',
      details: JSON.stringify({ name: 'Painting session', learningArea: 'CREATIVE' }),
      educatorId: 'user-1',
      createdAt: new Date().toISOString(),
    },
  ]);

  const selectedChild = useMemo(
    () => mockChildren.find((c) => c.id === selectedChildId) ?? null,
    [selectedChildId],
  );

  const roomChildren = useMemo(() => getRoomChildren(selectedRoomId), [selectedRoomId]);

  const childRecords = useMemo(
    () =>
      records
        .filter((r) => r.childId === selectedChildId && r.date === TODAY)
        .sort((a, b) => b.time.localeCompare(a.time)),
    [records, selectedChildId],
  );

  const toggleMealType = useCallback((meal: MealType) => {
    setMealForm((prev) => ({
      ...prev,
      meals: prev.meals.includes(meal) ? prev.meals.filter((m) => m !== meal) : [...prev.meals, meal],
    }));
  }, []);

  const resetForm = useCallback((tab: TabKey) => {
    switch (tab) {
      case 'meals':
        setMealForm({ ...emptyMeal, time: getCurrentTime() });
        break;
      case 'sleep':
        setSleepForm({ ...emptySleep, startTime: getCurrentTime() });
        break;
      case 'nappy':
        setNappyForm({ ...emptyNappy, time: getCurrentTime() });
        break;
      case 'water':
        setWaterForm({ ...emptyWater, time: getCurrentTime() });
        break;
      case 'activities':
        setActivityForm({ ...emptyActivity, time: getCurrentTime() });
        break;
      case 'notes':
        setNoteForm({ ...emptyNote, time: getCurrentTime() });
        break;
    }
  }, []);

  const saveRecord = useCallback(
    (tab: TabKey) => {
      if (!selectedChildId) return;

      let details = '';
      let type: CareType = 'NOTE';

      switch (tab) {
        case 'meals':
          if (mealForm.meals.length === 0) {
            dispatch(showSnackbar({ message: 'Please select at least one meal type', severity: 'warning' }));
            return;
          }
          details = JSON.stringify(mealForm);
          type = 'MEAL';
          break;
        case 'sleep':
          details = JSON.stringify(sleepForm);
          type = 'SLEEP';
          break;
        case 'nappy':
          details = JSON.stringify(nappyForm);
          type = nappyForm.type === 'SUCCESSFUL_TOILET' ? 'TOILETING' : 'NAPPY';
          break;
        case 'water':
          if (!waterForm.amount) {
            dispatch(showSnackbar({ message: 'Please enter an amount', severity: 'warning' }));
            return;
          }
          details = JSON.stringify(waterForm);
          type = 'BOTTLE';
          break;
        case 'activities':
          if (!activityForm.name) {
            dispatch(showSnackbar({ message: 'Please enter an activity name', severity: 'warning' }));
            return;
          }
          details = JSON.stringify(activityForm);
          type = 'ACTIVITY';
          break;
        case 'notes':
          if (!noteForm.content) {
            dispatch(showSnackbar({ message: 'Please enter a note', severity: 'warning' }));
            return;
          }
          details = JSON.stringify(noteForm);
          type = 'NOTE';
          break;
      }

      const newRecord: DailyCareRecord = {
        id: generateId(),
        childId: selectedChildId,
        centreId: 'centre-1',
        date: TODAY,
        type,
        time: getCurrentTime(),
        details,
        educatorId: 'user-1',
        createdAt: new Date().toISOString(),
      };

      setRecords((prev) => [newRecord, ...prev]);
      resetForm(tab);
      dispatch(showSnackbar({ message: 'Care record saved', severity: 'success' }));
    },
    [selectedChildId, mealForm, sleepForm, nappyForm, waterForm, activityForm, noteForm, dispatch, resetForm],
  );

  const renderChildSelector = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Room
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={selectedRoomId}
            onChange={(e) => {
              setSelectedRoomId(e.target.value);
              const firstChild = getRoomChildren(e.target.value)[0];
              if (firstChild) setSelectedChildId(firstChild.id);
            }}
          >
            {mockRooms.map((room) => (
              <MenuItem key={room.id} value={room.id}>
                {room.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Typography variant="subtitle2" sx={{ px: 2, pt: 2, pb: 1, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Children ({roomChildren.length})
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {roomChildren.map((child) => {
          const childTodayRecords = records.filter((r) => r.childId === child.id && r.date === TODAY);
          const isSelected = child.id === selectedChildId;
          return (
            <ListItemButton
              key={child.id}
              selected={isSelected}
              onClick={() => {
                setSelectedChildId(child.id);
                resetForm(activeTab);
              }}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.12) },
                },
              }}
            >
              <ListItemAvatar sx={{ minWidth: 48 }}>
                <Avatar firstName={child.firstName} lastName={child.lastName} size="small" src={child.photoUrl} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                    {child.firstName} {child.lastName}
                  </Typography>
                }
                secondary={
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {childTodayRecords.length > 0 && (
                      <Chip label={`${childTodayRecords.length} entries`} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                    {child.allergies && child.allergies.length > 0 && (
                      <Chip label="Allergies" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </Stack>
                }
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  const renderMealForm = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Record Meals
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select all meals provided
        </Typography>
        <FormGroup sx={{ mb: 2 }}>
          {(Object.keys(MEAL_LABELS) as MealType[]).map((meal) => (
            <FormControlLabel
              key={meal}
              control={
                <Checkbox
                  checked={mealForm.meals.includes(meal)}
                  onChange={() => toggleMealType(meal)}
                  size="small"
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" fontWeight={mealForm.meals.includes(meal) ? 600 : 400}>
                  {MEAL_LABELS[meal]}
                </Typography>
              }
            />
          ))}
        </FormGroup>
        <TextField
          fullWidth
          label="Time"
          type="time"
          size="small"
          value={mealForm.time}
          onChange={(e) => setMealForm((prev) => ({ ...prev, time: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Notes (optional)"
          size="small"
          multiline
          rows={2}
          value={mealForm.notes}
          onChange={(e) => setMealForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="e.g. Ate well, didn't finish, refused..."
          sx={{ mb: 2 }}
        />
        <Button variant="contained" startIcon={<Check />} onClick={() => saveRecord('meals')} fullWidth size="large">
          Save Meal Record
        </Button>
      </CardContent>
    </Card>
  );

  const renderSleepForm = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Record Sleep
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Start Time"
            type="time"
            size="small"
            value={sleepForm.startTime}
            onChange={(e) => setSleepForm((prev) => ({ ...prev, startTime: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sleepForm.inProgress}
                  onChange={(e) =>
                    setSleepForm((prev) => ({
                      ...prev,
                      inProgress: e.target.checked,
                      endTime: e.target.checked ? '' : prev.endTime,
                    }))
                  }
                  icon={<PlayArrow />}
                  checkedIcon={<Pause />}
                  color="primary"
                />
              }
              label={<Typography variant="body2">In Progress</Typography>}
            />
            {!sleepForm.inProgress && (
              <TextField
                fullWidth
                label="End Time"
                type="time"
                size="small"
                value={sleepForm.endTime}
                onChange={(e) => setSleepForm((prev) => ({ ...prev, endTime: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel>Quality</InputLabel>
            <Select
              value={sleepForm.quality}
              label="Quality"
              onChange={(e) => setSleepForm((prev) => ({ ...prev, quality: e.target.value as SleepQuality }))}
            >
              {(Object.keys(SLEEP_QUALITY_LABELS) as SleepQuality[]).map((q) => (
                <MenuItem key={q} value={q}>
                  {SLEEP_QUALITY_LABELS[q]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Notes (optional)"
            size="small"
            multiline
            rows={2}
            value={sleepForm.notes}
            onChange={(e) => setSleepForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="e.g. Slept soundly, woke once, restless..."
          />
          <Button variant="contained" startIcon={<Check />} onClick={() => saveRecord('sleep')} fullWidth size="large">
            Save Sleep Record
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderNappyForm = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Record Nappy / Toileting
        </Typography>
        <ToggleButtonGroup
          value={nappyForm.type}
          exclusive
          onChange={(_, value) => value && setNappyForm((prev) => ({ ...prev, type: value }))}
          fullWidth
          sx={{ mb: 2 }}
          size="small"
        >
          {(Object.keys(NAPPY_LABELS) as NappyType[]).map((t) => (
            <ToggleButton key={t} value={t} sx={{ textTransform: 'none' }}>
              {NAPPY_LABELS[t]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          fullWidth
          label="Time"
          type="time"
          size="small"
          value={nappyForm.time}
          onChange={(e) => setNappyForm((prev) => ({ ...prev, time: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Notes (optional)"
          size="small"
          multiline
          rows={2}
          value={nappyForm.notes}
          onChange={(e) => setNappyForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="e.g. Rash observed, needed change..."
          sx={{ mb: 2 }}
        />
        <Button variant="contained" startIcon={<Check />} onClick={() => saveRecord('nappy')} fullWidth size="large">
          Save Nappy Record
        </Button>
      </CardContent>
    </Card>
  );

  const renderWaterForm = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Record Water / Bottles
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Amount (e.g. 120ml, 6oz)"
            size="small"
            value={waterForm.amount}
            onChange={(e) => setWaterForm((prev) => ({ ...prev, amount: e.target.value }))}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={waterForm.type}
              label="Type"
              onChange={(e) => setWaterForm((prev) => ({ ...prev, type: e.target.value as BottleType }))}
            >
              {(Object.keys(BOTTLE_LABELS) as BottleType[]).map((t) => (
                <MenuItem key={t} value={t}>
                  {BOTTLE_LABELS[t]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Time"
            type="time"
            size="small"
            value={waterForm.time}
            onChange={(e) => setWaterForm((prev) => ({ ...prev, time: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" startIcon={<Check />} onClick={() => saveRecord('water')} fullWidth size="large">
            Save Water Record
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderActivityForm = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Record Activity
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Activity Name / Description"
            size="small"
            value={activityForm.name}
            onChange={(e) => setActivityForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Painting, Sand play, Story time..."
          />
          <FormControl fullWidth size="small">
            <InputLabel>Learning Area</InputLabel>
            <Select
              value={activityForm.learningArea}
              label="Learning Area"
              onChange={(e) => setActivityForm((prev) => ({ ...prev, learningArea: e.target.value as LearningArea }))}
            >
              {(Object.keys(LEARNING_AREA_LABELS) as LearningArea[]).map((area) => (
                <MenuItem key={area} value={area}>
                  {LEARNING_AREA_LABELS[area]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Time"
            type="time"
            size="small"
            value={activityForm.time}
            onChange={(e) => setActivityForm((prev) => ({ ...prev, time: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" startIcon={<Check />} onClick={() => saveRecord('activities')} fullWidth size="large">
            Save Activity Record
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderNoteForm = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Add Note
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Note"
            size="small"
            multiline
            rows={4}
            value={noteForm.content}
            onChange={(e) => setNoteForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="General observations, concerns, or updates..."
          />
          <TextField
            fullWidth
            label="Time"
            type="time"
            size="small"
            value={noteForm.time}
            onChange={(e) => setNoteForm((prev) => ({ ...prev, time: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" startIcon={<Check />} onClick={() => saveRecord('notes')} fullWidth size="large">
            Save Note
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderFormByTab = () => {
    switch (activeTab) {
      case 'meals':
        return renderMealForm();
      case 'sleep':
        return renderSleepForm();
      case 'nappy':
        return renderNappyForm();
      case 'water':
        return renderWaterForm();
      case 'activities':
        return renderActivityForm();
      case 'notes':
        return renderNoteForm();
      default:
        return null;
    }
  };

  const renderRecordDetail = (record: DailyCareRecord) => {
    let detailObj: Record<string, unknown>;
    try {
      detailObj = JSON.parse(record.details);
    } catch {
      return <Typography variant="body2">{record.details}</Typography>;
    }

    switch (record.type) {
      case 'MEAL': {
        const meals = (detailObj.meals as MealType[]) || [];
        return (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {meals.map((m) => (
              <Chip key={m} label={MEAL_LABELS[m]} size="small" color="primary" variant="outlined" sx={{ height: 22 }} />
            ))}
            {detailObj.notes && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {String(detailObj.notes)}
              </Typography>
            )}
          </Stack>
        );
      }
      case 'SLEEP':
        return (
          <Stack spacing={0.5}>
            <Typography variant="body2">
              {detailObj.startTime}
              {detailObj.endTime ? ` - ${detailObj.endTime}` : ' (In Progress)'}
              {detailObj.quality && ` - ${SLEEP_QUALITY_LABELS[detailObj.quality as SleepQuality]}`}
            </Typography>
            {detailObj.notes && (
              <Typography variant="caption" color="text.secondary">
                {String(detailObj.notes)}
              </Typography>
            )}
          </Stack>
        );
      case 'NAPPY':
      case 'TOILETING':
        return (
          <Stack spacing={0.5}>
            <Chip
              label={NAPPY_LABELS[detailObj.type as NappyType] || String(detailObj.type)}
              size="small"
              variant="outlined"
              sx={{ height: 22, alignSelf: 'flex-start' }}
            />
            {detailObj.notes && (
              <Typography variant="caption" color="text.secondary">
                {String(detailObj.notes)}
              </Typography>
            )}
          </Stack>
        );
      case 'WATER':
      case 'BOTTLE':
        return (
          <Typography variant="body2">
            {detailObj.amount} {BOTTLE_LABELS[detailObj.type as BottleType] || detailObj.type}
          </Typography>
        );
      case 'ACTIVITY':
        return (
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {String(detailObj.name)}
            </Typography>
            <Chip
              label={LEARNING_AREA_LABELS[detailObj.learningArea as LearningArea] || String(detailObj.learningArea)}
              size="small"
              variant="outlined"
              sx={{ height: 22, alignSelf: 'flex-start' }}
            />
          </Stack>
        );
      case 'NOTE':
        return (
          <Typography variant="body2" color="text.secondary">
            {String(detailObj.content)}
          </Typography>
        );
      default:
        return null;
    }
  };

  const getTypeColor = (type: CareType) => {
    const colors: Record<string, string> = {
      MEAL: theme.palette.primary.main,
      SLEEP: '#7C4DFF',
      NAPPY: '#FF6D00',
      TOILETING: '#FF6D00',
      WATER: '#00ACC1',
      BOTTLE: '#00ACC1',
      ACTIVITY: '#43A047',
      NOTE: '#546E7A',
    };
    return colors[type] || theme.palette.grey[500];
  };

  const getTypeLabel = (type: CareType) => {
    const labels: Record<string, string> = {
      MEAL: 'Meal',
      SLEEP: 'Sleep',
      NAPPY: 'Nappy',
      TOILETING: 'Toilet',
      WATER: 'Water',
      BOTTLE: 'Bottle',
      ACTIVITY: 'Activity',
      NOTE: 'Note',
    };
    return labels[type] || type;
  };

  const renderRecentEntries = () => (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Today's Entries
        </Typography>
        {childRecords.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <AccessTime sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No entries recorded today
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {childRecords.map((record) => (
              <Paper
                key={record.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderLeft: 3,
                  borderColor: getTypeColor(record.type),
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                  <Chip
                    label={getTypeLabel(record.type)}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      bgcolor: alpha(getTypeColor(record.type), 0.1),
                      color: getTypeColor(record.type),
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 14 }} />
                    {record.time}
                  </Typography>
                </Stack>
                {renderRecordDetail(record)}
              </Paper>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );

  const rightPanel = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {selectedChild && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar firstName={selectedChild.firstName} lastName={selectedChild.lastName} src={selectedChild.photoUrl} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selectedChild.firstName} {selectedChild.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getRoomName(selectedChild.roomId)}
              {selectedChild.allergies && selectedChild.allergies.length > 0 && (
                <> &middot; Allergies: {selectedChild.allergies.join(', ')}</>
              )}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={CARE_TABS.findIndex((t) => t.key === activeTab)}
          onChange={(_, idx) => {
            setActiveTab(CARE_TABS[idx].key);
            resetForm(CARE_TABS[idx].key);
          }}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 500 } }}
        >
          {CARE_TABS.map((tab) => (
            <Tab key={tab.key} icon={tab.icon} label={tab.label} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {renderFormByTab()}
        {renderRecentEntries()}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <PageHeader title="Daily Care" subtitle={formatDate(TODAY, 'EEEE, dd MMMM yyyy')} />
        </Box>

        <Box sx={{ px: 2, pb: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setMobileChildSelectorOpen(!mobileChildSelectorOpen)}
            endIcon={mobileChildSelectorOpen ? <ExpandLess /> : <ExpandMore />}
            sx={{ justifyContent: 'space-between', textTransform: 'none' }}
          >
            {selectedChild ? `${selectedChild.firstName} ${selectedChild.lastName}` : 'Select Child'}
          </Button>
          <Collapse in={mobileChildSelectorOpen}>
            <Paper variant="outlined" sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
              <List dense disablePadding>
                {mockRooms.map((room) => {
                  const children = getRoomChildren(room.id);
                  if (children.length === 0) return null;
                  return (
                    <Box key={room.id}>
                      <ListItem>
                        <ListItemText
                          primary={<Typography variant="caption" sx={{ fontWeight: 600 }} color="text.secondary">{room.name}</Typography>}
                        />
                      </ListItem>
                      {children.map((child) => (
                        <ListItemButton
                          key={child.id}
                          selected={child.id === selectedChildId}
                          onClick={() => {
                            setSelectedChildId(child.id);
                            setMobileChildSelectorOpen(false);
                            resetForm(activeTab);
                          }}
                          dense
                        >
                          <ListItemAvatar sx={{ minWidth: 36 }}>
                            <Avatar firstName={child.firstName} lastName={child.lastName} size="small" src={child.photoUrl} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2">{child.firstName} {child.lastName}</Typography>}
                          />
                        </ListItemButton>
                      ))}
                    </Box>
                  );
                })}
              </List>
            </Paper>
          </Collapse>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }}>
          <Tabs
            value={CARE_TABS.findIndex((t) => t.key === activeTab)}
            onChange={(_, idx) => {
              setActiveTab(CARE_TABS[idx].key);
              resetForm(CARE_TABS[idx].key);
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontSize: '0.8rem' } }}
          >
            {CARE_TABS.map((tab) => (
              <Tab key={tab.key} icon={tab.icon} label={tab.label} iconPosition="start" />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {renderFormByTab()}
          {renderRecentEntries()}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <PageHeader title="Daily Care" subtitle={formatDate(TODAY, 'EEEE, dd MMMM yyyy')} />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', p: 3, pt: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            width: 320,
            flexShrink: 0,
            mr: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          {renderChildSelector()}
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          {rightPanel}
        </Paper>
      </Box>
    </Box>
  );
}
