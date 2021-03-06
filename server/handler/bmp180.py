#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim: ts=2 sw=2 et ai
###############################################################################
# Copyright (c) 2012,2013-2017 Andreas Vogel andreas@wellenvogel.net
#
#  Permission is hereby granted, free of charge, to any person obtaining a
#  copy of this software and associated documentation files (the "Software"),
#  to deal in the Software without restriction, including without limitation
#  the rights to use, copy, modify, merge, publish, distribute, sublicense,
#  and/or sell copies of the Software, and to permit persons to whom the
#  Software is furnished to do so, subject to the following conditions:
#
#  The above copyright notice and this permission notice shall be included
#  in all copies or substantial portions of the Software.
#
#  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
#  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
#  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
#  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
#  DEALINGS IN THE SOFTWARE.
#
#  parts from this software (AIS decoding) are taken from the gpsd project
#  so refer to this BSD licencse also (see ais.py) or omit ais.py
#  parts contributed by free-x https://github.com/free-x
#  parts contributed by Matt Hawkins http://www.raspberrypi-spy.co.uk/
#
###############################################################################

import time
import threading

from ctypes import c_short

hasBMP180=False
try:
  import smbus
  hasBMP180=True
except:
  pass

from avnav_util import *
from avnav_nmea import *
from avnav_worker import *
import avnav_handlerList

bus=None

def convertToString(data):
  # Simple function to convert binary data into
  # a string
  return str((data[1] + (256 * data[0])) / 1.2)

def getShort(data, index):
  # return two bytes from data as a signed 16-bit value
  return c_short((data[index] << 8) + data[index + 1]).value

def getUshort(data, index):
  # return two bytes from data as an unsigned 16-bit value
  return (data[index] << 8) + data[index + 1]

def readBmp180Id(addr):
  # Chip ID Register Address
  REG_ID     = 0xD0
  (chip_id, chip_version) = bus.read_i2c_block_data(addr, REG_ID, 2)
  return (chip_id, chip_version)


def readBmp180(addr):
  # Register Addresses
  REG_CALIB  = 0xAA
  REG_MEAS   = 0xF4
  REG_MSB    = 0xF6
  REG_LSB    = 0xF7
  # Control Register Address
  CRV_TEMP   = 0x2E
  CRV_PRES   = 0x34 
  # Oversample setting
  OVERSAMPLE = 3    # 0 - 3
  
  # Read calibration data
  # Read calibration data from EEPROM
  cal = bus.read_i2c_block_data(addr, REG_CALIB, 22)

  # Convert byte data to word values
  AC1 = getShort(cal, 0)
  AC2 = getShort(cal, 2)
  AC3 = getShort(cal, 4)
  AC4 = getUshort(cal, 6)
  AC5 = getUshort(cal, 8)
  AC6 = getUshort(cal, 10)
  B1  = getShort(cal, 12)
  B2  = getShort(cal, 14)
  MB  = getShort(cal, 16)
  MC  = getShort(cal, 18)
  MD  = getShort(cal, 20)

  # Read temperature
  bus.write_byte_data(addr, REG_MEAS, CRV_TEMP)
  time.sleep(0.005)
  (msb, lsb) = bus.read_i2c_block_data(addr, REG_MSB, 2)
  UT = (msb << 8) + lsb

  # Read pressure
  bus.write_byte_data(addr, REG_MEAS, CRV_PRES + (OVERSAMPLE << 6))
  time.sleep(0.04)
  (msb, lsb, xsb) = bus.read_i2c_block_data(addr, REG_MSB, 3)
  UP = ((msb << 16) + (lsb << 8) + xsb) >> (8 - OVERSAMPLE)

  # Refine temperature
  X1 = ((UT - AC6) * AC5) >> 15
  X2 = (MC << 11) / (X1 + MD)
  B5 = X1 + X2
  temperature = int(B5 + 8) >> 4

  # Refine pressure
  B6  = B5 - 4000
  B62 = int(B6 * B6) >> 12
  X1  = (B2 * B62) >> 11
  X2  = int(AC2 * B6) >> 11
  X3  = X1 + X2
  B3  = (((AC1 * 4 + X3) << OVERSAMPLE) + 2) >> 2

  X1 = int(AC3 * B6) >> 13
  X2 = (B1 * B62) >> 16
  X3 = ((X1 + X2) + 2) >> 2
  B4 = (AC4 * (X3 + 32768)) >> 15
  B7 = (UP - B3) * (50000 >> OVERSAMPLE)

  P = (B7 * 2) / B4

  X1 = (int(P) >> 8) * (int(P) >> 8)
  X1 = (X1 * 3038) >> 16
  X2 = int(-7357 * P) >> 16
  pressure = int(P + ((X1 + X2 + 3791) >> 4))

  return (temperature/10.0,pressure/100.0)


class AVNBMP180Reader(AVNWorker):
  """ a worker to read data from the BMP180 module
    and insert it as NMEA MDA/XDR records
  """

  @classmethod
  def getConfigName(cls):
    return "AVNBMP180Reader"

  @classmethod
  def getConfigParam(cls, child=None):
    if not child is None:
      return None
    rt = {
      'feederName': '',  # if this one is set, we do not use the defaul feeder but this one
      'interval': '5',
      'writeMda': 'true',
      'writeXdr': 'true',
      'addr'    : '0x77'
    }
    return rt

  @classmethod
  def createInstance(cls, cfgparam):
    if cfgparam.get('name') is None:
      cfgparam['name'] = "BMP180Reader"
    rt = AVNBMP180Reader(cfgparam)
    return rt

  def __init__(self, param):
    self.feederWrite = None
    AVNWorker.__init__(self, param)
    if param.get('name') is None:
      self.param['name'] = "BMP180Reader"

  def isDisabled(self):
    if not hasBMP180:
      return True
    return super(AVNBMP180Reader, self).isDisabled()

  def getName(self):
    return self.param['name']

  # make some checks when we have to start
  # we cannot do this on init as we potentiall have to find the feeder...
  def start(self):
    feedername = self.getStringParam('feederName')
    feeder = self.findFeeder(feedername)
    if feeder is None:
      raise Exception("%s: cannot find a suitable feeder (name %s)", self.getName(), feedername or "")
    self.feederWrite = feeder.addNMEA
    AVNWorker.start(self)

  def writeData(self, data):
    self.feederWrite(data)

  # thread run method - just try forever
  def run(self):
    global bus
    if hasBMP180:
      bus = smbus.SMBus(1)  # Rev 2 Pi, Pi 2 & Pi 3 uses bus 1
    self.setName("[%s]%s" % (AVNLog.getThreadId(), self.getName()))
    self.setInfo('main', "reading BMP180", AVNWorker.Status.NMEA)
    addr = int(self.getStringParam('addr'),16)
    (chip_id,chip_version) = readBmp180Id(addr)
    info = "Using BMP180 Chip: %d Version: %d " % (chip_id,chip_version)
    AVNLog.info(info)
    while True:
      try:
        temperature,pressure = readBmp180(addr)
        if self.getBoolParam('writeMda'):
          """$WIMDA,30.2269,I,1.0236,B,17.7,C,,,43.3,,5.0,C,131.5,T,128.6,M,0.8,N,0.4,M"""
          mda = '$BMMDA,%.4f,I,%.4f,B,%.1f,C,,C,,,,C,,T,,M,,N,,M' % (pressure * 29.5301 / 1000., pressure / 1000.,temperature)
          mda += "*" + NMEAParser.nmeaChecksum(mda) + "\r\n"
          AVNLog.debug("BMP180:MDA %s", mda)
          self.writeData(mda)
        if self.getBoolParam('writeXdr'):
          xdr = '$BMXDR,P,%.4f,B,BMPRESSURE,C,%.1f,C,BMTEMP' % (pressure / 1000.,
                                                                                temperature)
          xdr += "*" + NMEAParser.nmeaChecksum(xdr) + "\r\n"
          AVNLog.debug("BMP180:XDR %s", xdr)
          self.writeData(xdr)
      except:
        AVNLog.info("exception while reading data from BMP180 %s" ,traceback.format_exc())
      wt = self.getFloatParam("interval")
      if not wt:
        wt = 5.0
      time.sleep(wt)


avnav_handlerList.registerHandler(AVNBMP180Reader)
