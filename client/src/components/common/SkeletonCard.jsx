import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export default function SkeletonCard() {
  return (
    <Card variant="outlined">
      <Skeleton variant="rectangular" height={180} animation="wave" />
      <CardContent>
        <Stack spacing={1}>
          <Skeleton variant="text" width="70%" height={28} />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="60%" />
        </Stack>
      </CardContent>
    </Card>
  );
}
