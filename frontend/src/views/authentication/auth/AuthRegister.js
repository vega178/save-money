import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link } from 'react-router-dom';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { Stack } from '@mui/system';

import { createUser } from '../../../services/userService';

const initialFormData = {
  username: '',
  email: '',
  password: '',
};

const AuthRegister = ({ title, subtitle, subtext }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = React.useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handlerSignUp = async () => {
    try {
      const response = await createUser(formData);
      console.log('Usuario creado:', response.data);
      setOpenSuccessModal(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      const msg = error?.message || 'An unexpected error occurred. Please try again.';
      setErrorMessage(msg);
      setOpenErrorModal(true);
    }
  };

  const handleCloseError = () => {
    setOpenErrorModal(false);
  };

  const handleCloseSuccess = () => {
    setOpenSuccessModal(false);
    window.location.href = '/auth/login';
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Box>
        <Stack mb={3}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="username"
            mb="5px"
          >
            User Name
          </Typography>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            onChange={(e) => setFormData((prevData) => ({ ...prevData, username: e.target.value }))}
            value={formData.username}
          />

          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="email"
            mb="5px"
            mt="25px"
          >
            Email Address
          </Typography>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            onChange={(e) => setFormData((prevData) => ({ ...prevData, email: e.target.value }))}
            value={formData.email}
          />

          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
            mt="25px"
          >
            Password
          </Typography>
          <OutlinedInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => setFormData((prevData) => ({ ...prevData, password: e.target.value }))}
            value={formData.password}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </Stack>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handlerSignUp}
        >
          Sign Up
        </Button>
      </Box>
      {subtitle}
      {/* Success dialog */}
      <Dialog
        fullScreen={fullScreen}
        open={openSuccessModal}
        onClose={handleCloseSuccess}
        aria-labelledby="register-success-dialog"
      >
        <DialogTitle id="register-success-dialog">Account Created!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your account has been created successfully. You can now sign in with
            your username or email.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button autoFocus onClick={handleCloseSuccess} variant="contained" color="primary">
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
      {/* Error dialog */}
      <Dialog
        fullScreen={fullScreen}
        open={openErrorModal}
        onClose={handleCloseError}
        aria-labelledby="register-error-dialog"
      >
        <DialogTitle id="register-error-dialog">Sign Up Failed</DialogTitle>
        <DialogContent>
          <DialogContentText>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button autoFocus onClick={handleCloseError} variant="contained" color="error">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthRegister;
