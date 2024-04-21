import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@mui/material';

import { Link } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import { login } from '../../../services/userService';

const initialFormData = {
  username: '',
  password: '',
};

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handlerLogin = async () => {
    try {
      const response = await login(formData);
      const token = response.data.token;
      //Decode a string in base 64
      const claims = JSON.parse(window.atob(token.split(".")[1]));
      sessionStorage.setItem('login', JSON.stringify({isAdmin: claims.isAdmin, username: response.data.username}));
      sessionStorage.setItem('token', `Bearer ${token}`);
    } catch (error) {
        if(error.response?.status === 401) {
            console.error('Login error user o password invalidos :', error);
        } else if(error.response?.status === 403) {
            console.error('Login error notiene acceso al recurso o permisos :', error);
        } else {
            console.error('Login error :', error);
        }
    }
  }

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}
      {subtext}
      <Stack>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="username"
            mb="5px"
          >
            Username
          </Typography>
          <CustomTextField
           id="username" 
           variant="outlined"
           onChange={(e) => setFormData((prevData) => ({ ...prevData, username: e.target.value }))}
           value={formData.username}
           fullWidth
          />
        </Box>
        <Box mt="25px">
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
          >
            Password
          </Typography>
          <OutlinedInput
            id="password"
            fullWidth
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
        </Box>
        <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Remeber this Device" />
          </FormGroup>
          <Typography
            component={Link}
            to="/"
            fontWeight="500"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
            }}
          >
            Forgot Password ?
          </Typography>
        </Stack>
      </Stack>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          component={Link}
          to="/dashboard"
          type="submit"
          onClick={handlerLogin}
        >
          Sign In
        </Button>
      </Box>
      {subtitle}
    </>
  );
};

export default AuthLogin;
