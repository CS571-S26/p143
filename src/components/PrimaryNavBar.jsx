import { Container, Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

function PrimaryNavBar() {
  return (
    <Navbar expand="md" className="primary-nav" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="brand-mark">
          AI Translation Pilot
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>
              Translate
            </Nav.Link>
            <Nav.Link as={NavLink} to="/workspace">
              Workspace
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default PrimaryNavBar
