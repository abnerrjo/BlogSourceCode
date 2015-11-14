<?php
class ScientificNotationTest extends PHPUnit_Framework_TestCase {
	
	public function setUp() {
		require_once 'ScientificNotation.php';
	}
	
	public function testMultiply() {
		$number1 = new ScientificNotation(2.0, 3);
		$number2 = new ScientificNotation(4.0, 2);
		$number1->multiply($number2);
		$this->assertEquals(8.0, $number1->getMantissa());
		$this->assertEquals(5, $number1->getExponent());
	}
	
	public function testDivide() {
		$number1 = new ScientificNotation(2.0, 3);
		$number2 = new ScientificNotation(4.0, 2);
		$number1->divide($number2);
		$this->assertEquals(0.5, $number1->getMantissa());
		$this->assertEquals(1, $number1->getExponent());
	}
	
	public function testAdd() {
		//must be ok
		$number1 = new ScientificNotation(2.0, 5);
		$number2 = new ScientificNotation(4.0, 5);
		$number1->add($number2);
		$this->assertEquals(6.0, $number1->getMantissa());
		$this->assertEquals(5, $number1->getExponent());
		//must throw exception
		$number1 = new ScientificNotation(3.0, 4);
		$number2 = new ScientificNotation(2.0, 3);
		try {
			$number1->add($number2);
			$this->fail();
		} catch(Exception $e) { } 
	}
	
	public function testSubtract() {
		//must be ok
		$number1 = new ScientificNotation(2.0, 5);
		$number2 = new ScientificNotation(4.0, 5);
		$number1->subtract($number2);
		$this->assertEquals(-2.0, $number1->getMantissa());
		$this->assertEquals(5, $number1->getExponent());
		//must throw exception
		$number1 = new ScientificNotation(3.0, 4);
		$number2 = new ScientificNotation(2.0, 3);
		try {
			$number1->subtract($number2);
			$this->fail();
		} catch(Exception $e) { } 
	}
	
	public function testNormalize() {
		$unmormalizedNumber1 = new ScientificNotation(800.0, 2);
		$unnormalizedNumber2 = new ScientificNotation(0.08, -4);
		$unmormalizedNumber1->normalize();
		$this->assertEquals(8.0, $unmormalizedNumber1->getMantissa());
		$this->assertEquals(4, $unmormalizedNumber1->getExponent());
		$unnormalizedNumber2->normalize();
		$this->assertEquals(8.0, $unnormalizedNumber2->getMantissa());
		$this->assertEquals(-6, $unnormalizedNumber2->getExponent());
	}
	
}
?>
