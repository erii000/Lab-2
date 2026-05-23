import {
  AddRounded,
  AutoAwesomeRounded,
  DeleteOutlineRounded,
  DragIndicatorRounded,
  EditRounded,
} from "../../ui/icons.jsx";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { designTokens } from "../../theme/theme.js";

function ActivityRow({ activity, onDelete, onEdit, dragHandlers }) {
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
        <IconButton size="small" onClick={() => onEdit(activity)} aria-label="Edit">
          <EditRounded sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(activity.id)} aria-label="Delete">
          <DeleteOutlineRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default function TripTimeline({ days, onDaysChange, onOpenAiAssist }) {
  const [dragSource, setDragSource] = useState(null);
  const [editing, setEditing] = useState(null);

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
      return next;
    });
    setDragSource(null);
  }

  function addActivity(dayIndex) {
    updateDays((current) => {
      const next = [...current];
      next[dayIndex] = {
        ...next[dayIndex],
        activities: [
          ...next[dayIndex].activities,
          {
            id: `new-${Date.now()}`,
            time: "12:00",
            title: "New activity",
            subtitle: "Tap edit to customize",
            cost: 0,
          },
        ],
      };
      return next;
    });
  }

  function deleteActivity(dayIndex, activityId) {
    updateDays((current) =>
      current.map((d, i) =>
        i === dayIndex ? { ...d, activities: d.activities.filter((a) => a.id !== activityId) } : d,
      ),
    );
  }

  function saveEdit() {
    if (!editing) return;
    updateDays((current) =>
      current.map((d, i) =>
        i === editing.dayIndex
          ? {
              ...d,
              activities: d.activities.map((a) => (a.id === editing.activity.id ? editing.activity : a)),
            }
          : d,
      ),
    );
    setEditing(null);
  }

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
              {day.activities.map((activity, actIndex) => (
                <Box
                  key={activity.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(dayIndex, actIndex)}
                >
                  <ActivityRow
                    activity={activity}
                    onDelete={(id) => deleteActivity(dayIndex, id)}
                    onEdit={(act) => setEditing({ dayIndex, activity: { ...act } })}
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
              onClick={() => addActivity(dayIndex)}
              sx={{ mt: 1.5, fontWeight: 600, color: "text.secondary" }}
            >
              Add activity
            </Button>
          </Box>
        ))}
      </Stack>

      {editing ? (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha(designTokens.brand.gold, 0.2)}`,
            bgcolor: alpha(designTokens.brand.charcoal, 0.8),
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Edit activity
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label="Time"
              value={editing.activity.time}
              onChange={(e) =>
                setEditing({ ...editing, activity: { ...editing.activity, time: e.target.value } })
              }
            />
            <TextField
              size="small"
              label="Title"
              value={editing.activity.title}
              onChange={(e) =>
                setEditing({ ...editing, activity: { ...editing.activity, title: e.target.value } })
              }
            />
            <TextField
              size="small"
              label="Subtitle"
              value={editing.activity.subtitle}
              onChange={(e) =>
                setEditing({ ...editing, activity: { ...editing.activity, subtitle: e.target.value } })
              }
            />
            <TextField
              size="small"
              label="Price (€)"
              type="number"
              value={editing.activity.cost}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  activity: { ...editing.activity, cost: Number(e.target.value) || 0 },
                })
              }
            />
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" onClick={saveEdit}>
                Save
              </Button>
              <Button size="small" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}
