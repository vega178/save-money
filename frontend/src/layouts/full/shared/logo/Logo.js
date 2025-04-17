import { Link } from 'react-router-dom';
import { ReactComponent as LogoDark } from 'src/assets/images/logos/dark-logo.svg';
import { styled } from '@mui/material';

const LinkStyled = styled(Link)(() => ({
  height: '80px',
  overflow: 'hidden',
  display: 'block',
}));

const Logo = () => {
  return (
   <LinkStyled to="/">
      <LogoDark height={70} />
   </LinkStyled>
  )
};

export default Logo;
