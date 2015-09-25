#!/usr/bin/env python
# -*- coding: UTF-8 -*-
#
# generated by wxGlade not found on Mon Nov 10 09:46:54 2014
#

import wx

# begin wxGlade: dependencies
import gettext
# end wxGlade

_=gettext.gettext

# begin wxGlade: extracode
# end wxGlade


class Avnav(wx.Frame):
    def __init__(self, *args, **kwds):
        # begin wxGlade: Avnav.__init__
        wx.Frame.__init__(self, *args, **kwds)
        self.inputFiles = wx.TextCtrl(self, wx.ID_ANY, "", style=wx.TE_MULTILINE)
        self.btSelectInput = wx.Button(self, wx.ID_ANY, _("SelectFile"))
        self.btEmpty = wx.Button(self, wx.ID_ANY, _("Clear"))
        self.label_2 = wx.StaticText(self, wx.ID_ANY, _("OutputDir"))
        self.outputDir = wx.TextCtrl(self, wx.ID_ANY, "")
        self.btSelectOut = wx.Button(self, wx.ID_ANY, _("Change"))
        self.btOutDefault = wx.Button(self, wx.ID_ANY, _("Default"))
        self.updateMode = wx.CheckBox(self, wx.ID_ANY, _("update mode"))
        self.cbLogfile = wx.CheckBox(self, wx.ID_ANY, _("logfile"))
        self.txLogfile = wx.TextCtrl(self, wx.ID_ANY, "")
        self.btStart = wx.Button(self, wx.ID_ANY, _("Convert"))
        self.static_line_2 = wx.StaticLine(self, wx.ID_ANY)
        self.startServer = wx.CheckBox(self, wx.ID_ANY, _("auto start server"))
        self.serverPid = wx.StaticText(self, wx.ID_ANY, _("server stopped"))
        self.btStartServer = wx.Button(self, wx.ID_ANY, _("Start Server"))
        self.static_line_3 = wx.StaticLine(self, wx.ID_ANY)
        self.btExit = wx.Button(self, wx.ID_ANY, _("Exit"))

        self.__set_properties()
        self.__do_layout()

        self.Bind(wx.EVT_BUTTON, self.btSelectInputClicked, self.btSelectInput)
        self.Bind(wx.EVT_BUTTON, self.btEmptyClicked, self.btEmpty)
        self.Bind(wx.EVT_BUTTON, self.btSelectOutClicked, self.btSelectOut)
        self.Bind(wx.EVT_BUTTON, self.btOutDefaultClicked, self.btOutDefault)
        self.Bind(wx.EVT_BUTTON, self.btStartClicked, self.btStart)
        self.Bind(wx.EVT_BUTTON, self.btStartServerClicked, self.btStartServer)
        self.Bind(wx.EVT_BUTTON, self.btExitClicked, self.btExit)
        # end wxGlade

    def __set_properties(self):
        # begin wxGlade: Avnav.__set_properties
        self.SetTitle(_("Avnav"))
        self.SetSize((1134, 503))
        self.inputFiles.SetBackgroundColour(wx.Colour(255, 247, 69))
        self.serverPid.SetBackgroundColour(wx.Colour(112, 219, 147))
        self.serverPid.SetForegroundColour(wx.Colour(255, 0, 0))
        # end wxGlade

    def __do_layout(self):
        # begin wxGlade: Avnav.__do_layout
        sizer_main = wx.BoxSizer(wx.HORIZONTAL)
        sizer_left = wx.BoxSizer(wx.VERTICAL)
        sizer_2 = wx.BoxSizer(wx.HORIZONTAL)
        sizer_5 = wx.BoxSizer(wx.HORIZONTAL)
        sizer_6 = wx.BoxSizer(wx.HORIZONTAL)
        sizer_10 = wx.BoxSizer(wx.HORIZONTAL)
        sizer_7 = wx.BoxSizer(wx.HORIZONTAL)
        sizer_9 = wx.BoxSizer(wx.HORIZONTAL)
        sizer_3 = wx.BoxSizer(wx.HORIZONTAL)
        sizer_right_bt_top = wx.BoxSizer(wx.VERTICAL)
        sizer_3.Add(self.inputFiles, 4, wx.EXPAND, 5)
        sizer_right_bt_top.Add(self.btSelectInput, 0, wx.RIGHT | wx.ALIGN_RIGHT, 5)
        sizer_right_bt_top.Add(self.btEmpty, 0, wx.ALL | wx.ALIGN_RIGHT, 5)
        sizer_3.Add(sizer_right_bt_top, 0, wx.LEFT | wx.RIGHT, 5)
        sizer_left.Add(sizer_3, 10, wx.LEFT | wx.EXPAND, 5)
        sizer_9.Add(self.label_2, 0, wx.LEFT | wx.RIGHT | wx.ALIGN_CENTER_VERTICAL, 3)
        sizer_9.Add(self.outputDir, 4, wx.LEFT | wx.RIGHT | wx.EXPAND | wx.ALIGN_CENTER_VERTICAL, 3)
        sizer_9.Add(self.btSelectOut, 0, wx.LEFT | wx.RIGHT, 5)
        sizer_7.Add(sizer_9, 4, wx.RIGHT | wx.EXPAND, 5)
        sizer_7.Add(self.btOutDefault, 0, wx.LEFT | wx.RIGHT, 5)
        sizer_left.Add(sizer_7, 0, wx.LEFT | wx.TOP | wx.BOTTOM | wx.EXPAND, 5)
        sizer_10.Add(self.updateMode, 0, wx.LEFT | wx.ALIGN_CENTER_VERTICAL, 8)
        sizer_10.Add(self.cbLogfile, 0, wx.LEFT | wx.ALIGN_CENTER_VERTICAL, 5)
        sizer_10.Add(self.txLogfile, 4, wx.LEFT | wx.RIGHT | wx.EXPAND, 10)
        sizer_6.Add(sizer_10, 4, wx.RIGHT | wx.EXPAND, 5)
        sizer_6.Add(self.btStart, 0, wx.ALIGN_RIGHT, 0)
        sizer_left.Add(sizer_6, 0, wx.ALL | wx.EXPAND, 5)
        sizer_left.Add(self.static_line_2, 0, wx.EXPAND, 0)
        sizer_5.Add(self.startServer, 0, wx.LEFT | wx.EXPAND | wx.ALIGN_CENTER_VERTICAL, 8)
        sizer_5.Add(self.serverPid, 10, wx.LEFT | wx.RIGHT | wx.ALIGN_CENTER_VERTICAL, 5)
        sizer_5.Add(self.btStartServer, 0, wx.EXPAND, 0)
        sizer_left.Add(sizer_5, 0, wx.ALL | wx.EXPAND, 5)
        sizer_left.Add(self.static_line_3, 0, wx.EXPAND, 0)
        sizer_2.Add(self.btExit, 0, wx.LEFT | wx.ALIGN_RIGHT, 30)
        sizer_left.Add(sizer_2, 0, wx.ALL | wx.ALIGN_RIGHT, 5)
        sizer_main.Add(sizer_left, 5, wx.EXPAND, 0)
        self.SetSizer(sizer_main)
        self.Layout()
        # end wxGlade

    def btSelectInputClicked(self, event):  # wxGlade: Avnav.<event_handler>
        print "Event handler 'btSelectInputClicked' not implemented!"
        event.Skip()

    def btEmptyClicked(self, event):  # wxGlade: Avnav.<event_handler>
        print "Event handler 'btEmptyClicked' not implemented!"
        event.Skip()

    def btSelectOutClicked(self, event):  # wxGlade: Avnav.<event_handler>
        print "Event handler 'btSelectOutClicked' not implemented!"
        event.Skip()

    def btOutDefaultClicked(self, event):  # wxGlade: Avnav.<event_handler>
        print "Event handler 'btOutDefaultClicked' not implemented!"
        event.Skip()

    def btStartClicked(self, event):  # wxGlade: Avnav.<event_handler>
        print "Event handler 'btStartClicked' not implemented!"
        event.Skip()

    def btStartServerClicked(self, event):  # wxGlade: Avnav.<event_handler>
        print "Event handler 'btStartServerClicked' not implemented!"
        event.Skip()

    def btExitClicked(self, event):  # wxGlade: Avnav.<event_handler>
        print "Event handler 'btExitClicked' not implemented!"
        event.Skip()

# end of class Avnav
