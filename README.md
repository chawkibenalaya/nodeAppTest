 <TextField
   label="Trusted Certificate"
   {...field}
+  multiline
+  minRows={6}
+  maxRows={16}
   error={!!fieldState.error}
-  value={field.value}
+  value={field.value ?? ""}
   helperText={fieldState.error?.message}
   fullWidth
+  sx={{ "& textarea": { fontFamily: "monospace", fontSize: 12 } }}
 />
