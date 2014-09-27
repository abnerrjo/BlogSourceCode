<?php
class ScientificNotation {
	
	private $mantissa;
	private $exponent;
	
	function __construct($mantissa, $exponent) {
		$this->setMantissa($mantissa);
		$this->setExponent($exponent);
	}

	public function getMantissa() {
		return $this->mantissa;
	}
	
	public function setMantissa($mantissa) {
		$this->mantissa = $mantissa;
	}
	
	public function getExponent() {
		return $this->exponent;
	}
	
	public function setExponent($exponent) {
		$this->exponent = $exponent;
	}
	
	public function add($number) {
		if ($number->getExponent() != $this->exponent) {
			throw new Exception("Can't add two numbers with different exponents.");
		}
		$this->mantissa += $number->getMantissa();
	}
	
	public function subtract($number) {
		if ($number->getExponent() != $this->exponent) {
			throw new Exception("Can't subtract two numbers with different exponents.");
		}
		$this->mantissa -= $number->getMantissa();
	}
	
	public function multiply($number) {
		$this->mantissa *= $number->getMantissa();
		$this->exponent += $number->getExponent();
	}
	
	public function divide($number) {
		$this->mantissa /= $number->getMantissa();
		$this->exponent -= $number->getExponent();
	}
	
	public function normalize() {
		while (abs($this->mantissa) > 10) {
			$this->mantissa /= 10;
			$this->exponent += 1;
		}
		while (abs($this->mantissa) < 1) {
			$this->mantissa *= 10;
			$this->exponent -= 1;
		}
	}
	
}
?>
