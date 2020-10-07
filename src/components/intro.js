import React from 'react';
import { Row, Container, Col, Button } from 'reactstrap';

function Intro(props) {

    return (
    <Container>
        <Row style={{marginTop:'10vh', minHeight:'50vh', zIndex:'-1'}}>
            <Col sm='12' md={{ size: 6, offset: 3}}>
                    <h1 style={{
                        color:'#45fff4',
                        fontFamily:'Jura',
                        fontWeight:'bold',
                        lineHeight:'125%',
                        fontSize:'46px',
                        textTransform:'uppercase'
                        }}>Stake your HEGIC and start earning fees</h1>
                    <div style={{color: '#defefe', fontFamily:'Exo 2', fontWeight:'500', lineHeight:'150%'}}>
                    Trade non-custodial options for profits or to hedge your positions.
Enjoy fixed price and unlimited upside of the options contracts.
No registration, KYC or email required.
                    </div>
                    <div style={{marginTop:'25px', display:'flex', justifyContent:'center'}}>
                    <Button style={{
                        color:'#15203d',
                        fontWeight:'bold',
                        fontFamily:'Jura',
                        letterSpacing:'.1em',
                        background:'transparent',
                        borderImageSource:'url(https://www.hegic.co/assets/img/button-primary.svg)', 
                        borderImageSlice:'20',
                        borderStyle:'solid',
                        boxSizing:'border-box',
                        borderRadius:'2px',
                        borderImageWidth:'50px'}} 
                        onClick={props.connect}>CONNECT WALLET</Button>
                    </div>
            </Col>
        </Row>
    </Container>);
}

export default Intro;