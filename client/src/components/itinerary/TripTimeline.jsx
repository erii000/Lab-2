import {
  AddRounded,
  AutoAwesomeRounded,
  DeleteOutlineRounded,
  DragIndicatorRounded,
} from "../../ui/icons.jsx";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import {
  computeNextActivityTime,
  getActivitySuggestions,
  sortActivitiesByTime,
} from "../../utils/itineraryPlanner.js";
import { designTokens } from "../../theme/theme.js";

function isCustomActivity(activity) {
  if (activity.isCustom === true) return true;
  if (activity.isCustom === false) return false;
  return String(activity.id).startsWith("new-");
}

function ActivityRow({ activity, onDelete, canDelete, dragHandlers }) {
  return (
    <Box
      draggable
      {...dragHandlers}
      sx={{
        display: "grid",
        gridTemplateColumns: "56px 1fr auto",
        gap: 1.5,
        alignItems: "start",
        py: 1.5,
        px: 1.5,
        borderRadius: 2,
        bgcolor: alpha(designTokens.brand.graphite, 0.35),
        border: `1px solid ${alpha(designTokens.brand.gold, 0.08)}`,
        cursor: "grab",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: `0 8px 24px ${alpha("#000", 0.2)}` },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <DragIndicatorRounded sx={{ fontSize: 18, color: "text.disabled" }} />
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          {activity.time}
        </Typography>
      </Stack>
      <Box>
        <Typography variant="body2" fontWeight={700}>
          {activity.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45, display: "block" }}>
          {activity.subtitle}
        </Typography>
      </Box>
      <Stack direction="row" alignItems="center" spacing={0.25}>
        <Typography variant="caption" fontWeight={700} sx={{ mr: 0.5, minWidth: 36, textAlign: "right" }}>
          {activity.cost ? `€${activity.cost}` : "—"}
        </Typography>
        {canDelete ? (
          <IconButton size="small" onClick={() => onDelete(activity.id)} aria-label="Remove">
            <DeleteOutlineRounded sx={{ fontSize: 16 }} />
          </IconButton>
        ) : null}
      </Stack>
    </Box>
  );
}

function ActivitySuggestionPicker({ suggestions, onSelect, onCancel }) {
  return (
    <Box
      sx={{
        mt: 1.5,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(designTokens.brand.gold, 0.25)}`,
        bgcolor: alpha(designTokens.brand.charcoal, 0.85),
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
        Choose an activity
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        Tap a suggestion — we&apos;ll schedule it at the next free time slot for this day.
      </Typography>

      {suggestions.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap sx={{ mb: 1.5 }}>
          {suggestions.map((s) => (
            <Chip
              key={s.title}
              label={s.title}
              size="small"
              onClick={() => onSelect(s)}
              sx={{
                fontWeight: 600,
                borderColor: alpha(designTokens.brand.gold, 0.35),
                "&:hover": { bgcolor: alpha(designTokens.brand.gold, 0.12) },
              }}
              variant="outlined"
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          No more suggestions for this day — try another day or remove an activity first.
        </Typography>
      )}

      <Button size="small" onClick={onCancel}>
        Cancel
      </Button>
    </Box>
  );
}

export default function TripTimeline({ days, destination, travelers = 2, onDaysChange, onOpenAiAssist }) {
  const [dragSource, setDragSource] = useState(null);
  const [addingDayIndex, setAddingDayIndex] = useState(null);

  function updateDays(updater) {
    onDaysChange(typeof updater === "function" ? updater(days) : updater);
  }

  function handleDrop(dayIndex, targetIndex) {
    if (!dragSource) return;
    const { dayIndex: fromDay, activityIndex: fromAct } = dragSource;
    updateDays((current) => {
      const next = current.map((d) => ({ ...d, activities: [...d.activities] }));
      const [moved] = next[fromDay].activities.splice(fromAct, 1);
      next[dayIndex].activities.splice(targetIndex, 0, moved);
      next[dayIndex].activities = sortActivitiesByTime(next[dayIndex].activities);
      return next;
    });
    setDragSource(null);
  }

  function addFromSuggestion(dayIndex, suggestion) {
    updateDays((current) => {
      const next = [...current];
      const day = next[dayIndex];
      const time = computeNextActivityTime(day.activities);
      const activities = sortActivitiesByTime([
        ...day.activities,
        {
          id: `new-${Date.now()}`,
          time,
          title: suggestion.title,
          subtitle: suggestion.subtitle,
          cost: suggestion.cost,
          isCustom: true,
        },
      ]);
      next[dayIndex] = { ...day, activities };
      return next;
    });
    setAddingDayIndex(null);
  }

  function deleteActivity(dayIndex, activityId) {
    updateDays((current) =>
      current.map((d, i) =>
        i === dayIndex ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) } : d,
      ),
    );
  }

  const suggestionsByDay = useMemo(() => {
    const map = new Map();
    days.forEach((day, dayIndex) => {
      const titles = day.activities.map((a) => a.title);
      map.set(dayIndex, getActivitySuggestions(destination, { guests: travelers, excludeTitles: titles }));
    });
    return map;
  }, [days, destination, travelers]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={800}>
          Your timeline
        </Typography>
        <Button
          size="small"
          variant="text"
          startIcon={<AutoAwesomeRounded sx={{ fontSize: 18 }} />}
          onClick={onOpenAiAssist}
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          AI Assist
        </Button>
      </Stack>

      <Stack spacing={4}>
        {days.map((day, dayIndex) => (
          <Box key={day.day}>
            <Typography variant="overline" color="secondary.main" fontWeight={800} sx={{ letterSpacing: "0.1em" }}>
              Day {day.day}
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {day.label}
            </Typography>
            <Stack spacing={1}>
              {sortActivitiesByTime(day.activities).map((activity, actIndex) => (
                <Box
                  key={activity.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(dayIndex, actIndex)}
                >
                  <ActivityRow
                    activity={activity}
                    canDelete={isCustomActivity(activity)}
                    onDelete={(id) => deleteActivity(dayIndex, id)}
                    dragHandlers={{
                      onDragStart: () => setDragSource({ dayIndex, activityIndex: actIndex }),
                      onDragEnd: () => setDragSource(null),
                    }}
                  />
                </Box>
              ))}
            </Stack>

            <Button
              size="small"
              startIcon={<AddRounded sx={{ fontSize: 16 }} />}
              onClick={() => setAddingDayIndex(dayIndex)}
              sx={{ mt: 1.5, fontWeight: 600, color: "text.secondary" }}
            >
              Add activity
            </Button>

            {addingDayIndex === dayIndex ? (
              <ActivitySuggestionPicker
                suggestions={suggestionsByDay.get(dayIndex) ?? []}
                onSelect={(s) => addFromSuggestion(dayIndex, s)}
                onCancel={() => setAddingDayIndex(null)}
              />
            ) : null}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
