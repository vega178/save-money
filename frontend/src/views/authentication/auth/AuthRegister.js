import React, { useState } from 'react';
import { Box, Typography, Button, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
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
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handlerSignUp = async () => {
    try {
      const response = await createUser(formData);
      console.log('Usuario creado:', response.data);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
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
          component={Link}
          to="/auth/login"
          onClick={handlerSignUp}
        >
          Sign Up
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthRegister;
