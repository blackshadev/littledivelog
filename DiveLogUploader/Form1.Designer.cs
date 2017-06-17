namespace divecomputer_test {
    partial class Form1 {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing) {
            if (disposing && (components != null)) {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent() {
            this.ComputerSelectLabel = new System.Windows.Forms.Label();
            this.ComputerSelector = new System.Windows.Forms.ComboBox();
            this.VersionLabel = new System.Windows.Forms.Label();
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.ComputerTab = new System.Windows.Forms.TabPage();
            this.label1 = new System.Windows.Forms.Label();
            this.radioButton2 = new System.Windows.Forms.RadioButton();
            this.radioButton1 = new System.Windows.Forms.RadioButton();
            this.BrowseButton = new System.Windows.Forms.Button();
            this.SaveFileText = new System.Windows.Forms.TextBox();
            this.SaveFileLabel = new System.Windows.Forms.Label();
            this.RefreshPortButton = new System.Windows.Forms.Button();
            this.PortLabel = new System.Windows.Forms.Label();
            this.PortSelector = new System.Windows.Forms.ComboBox();
            this.StateLabel = new System.Windows.Forms.Label();
            this.StartButton = new System.Windows.Forms.Button();
            this.Progress = new System.Windows.Forms.ProgressBar();
            this.DiversLogTab = new System.Windows.Forms.TabPage();
            this.flowLayoutPanel1 = new System.Windows.Forms.FlowLayoutPanel();
            this.LoginPanel = new System.Windows.Forms.GroupBox();
            this.AuthErrLabel = new System.Windows.Forms.Label();
            this.loginButton = new System.Windows.Forms.Button();
            this.label3 = new System.Windows.Forms.Label();
            this.passwordInput = new System.Windows.Forms.TextBox();
            this.UsernameIput = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.AccountPanel = new System.Windows.Forms.GroupBox();
            this.LogTab = new System.Windows.Forms.TabPage();
            this.LogTextBox = new System.Windows.Forms.RichTextBox();
            this.LogLevelSelector = new System.Windows.Forms.ComboBox();
            this.panel1 = new System.Windows.Forms.Panel();
            this.panel2 = new System.Windows.Forms.Panel();
            this.DivecomputerWorker = new System.ComponentModel.BackgroundWorker();
            this.SaveFileDialog = new System.Windows.Forms.SaveFileDialog();
            this.label4 = new System.Windows.Forms.Label();
            this.label5 = new System.Windows.Forms.Label();
            this.label6 = new System.Windows.Forms.Label();
            this.label7 = new System.Windows.Forms.Label();
            this.LabelAccountEmail = new System.Windows.Forms.Label();
            this.LabelAccountName = new System.Windows.Forms.Label();
            this.LabelAccountDiveCount = new System.Windows.Forms.Label();
            this.LabelAccountLastUpload = new System.Windows.Forms.Label();
            this.tabControl1.SuspendLayout();
            this.ComputerTab.SuspendLayout();
            this.DiversLogTab.SuspendLayout();
            this.flowLayoutPanel1.SuspendLayout();
            this.LoginPanel.SuspendLayout();
            this.AccountPanel.SuspendLayout();
            this.LogTab.SuspendLayout();
            this.panel1.SuspendLayout();
            this.panel2.SuspendLayout();
            this.SuspendLayout();
            // 
            // ComputerSelectLabel
            // 
            this.ComputerSelectLabel.AutoSize = true;
            this.ComputerSelectLabel.Location = new System.Drawing.Point(6, 35);
            this.ComputerSelectLabel.Name = "ComputerSelectLabel";
            this.ComputerSelectLabel.Size = new System.Drawing.Size(52, 13);
            this.ComputerSelectLabel.TabIndex = 0;
            this.ComputerSelectLabel.Text = "Computer";
            // 
            // ComputerSelector
            // 
            this.ComputerSelector.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.ComputerSelector.FormattingEnabled = true;
            this.ComputerSelector.Location = new System.Drawing.Point(66, 32);
            this.ComputerSelector.Name = "ComputerSelector";
            this.ComputerSelector.Size = new System.Drawing.Size(428, 21);
            this.ComputerSelector.TabIndex = 1;
            this.ComputerSelector.SelectedIndexChanged += new System.EventHandler(this.ComputerSelector_Changed);
            // 
            // VersionLabel
            // 
            this.VersionLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.VersionLabel.Location = new System.Drawing.Point(0, 0);
            this.VersionLabel.Name = "VersionLabel";
            this.VersionLabel.Size = new System.Drawing.Size(508, 24);
            this.VersionLabel.TabIndex = 2;
            this.VersionLabel.Text = "_version_";
            this.VersionLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // tabControl1
            // 
            this.tabControl1.Controls.Add(this.ComputerTab);
            this.tabControl1.Controls.Add(this.DiversLogTab);
            this.tabControl1.Controls.Add(this.LogTab);
            this.tabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabControl1.Location = new System.Drawing.Point(0, 0);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(508, 171);
            this.tabControl1.TabIndex = 3;
            // 
            // ComputerTab
            // 
            this.ComputerTab.Controls.Add(this.label1);
            this.ComputerTab.Controls.Add(this.radioButton2);
            this.ComputerTab.Controls.Add(this.radioButton1);
            this.ComputerTab.Controls.Add(this.BrowseButton);
            this.ComputerTab.Controls.Add(this.SaveFileText);
            this.ComputerTab.Controls.Add(this.SaveFileLabel);
            this.ComputerTab.Controls.Add(this.RefreshPortButton);
            this.ComputerTab.Controls.Add(this.PortLabel);
            this.ComputerTab.Controls.Add(this.PortSelector);
            this.ComputerTab.Controls.Add(this.StateLabel);
            this.ComputerTab.Controls.Add(this.StartButton);
            this.ComputerTab.Controls.Add(this.Progress);
            this.ComputerTab.Controls.Add(this.ComputerSelectLabel);
            this.ComputerTab.Controls.Add(this.ComputerSelector);
            this.ComputerTab.Location = new System.Drawing.Point(4, 22);
            this.ComputerTab.Name = "ComputerTab";
            this.ComputerTab.Padding = new System.Windows.Forms.Padding(3);
            this.ComputerTab.Size = new System.Drawing.Size(500, 145);
            this.ComputerTab.TabIndex = 0;
            this.ComputerTab.Text = "Computer";
            this.ComputerTab.UseVisualStyleBackColor = true;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(6, 87);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(46, 13);
            this.label1.TabIndex = 13;
            this.label1.Text = "Save as";
            // 
            // radioButton2
            // 
            this.radioButton2.AutoSize = true;
            this.radioButton2.Location = new System.Drawing.Point(157, 85);
            this.radioButton2.Name = "radioButton2";
            this.radioButton2.Size = new System.Drawing.Size(84, 17);
            this.radioButton2.TabIndex = 12;
            this.radioButton2.TabStop = true;
            this.radioButton2.Text = "On diverslog";
            this.radioButton2.UseVisualStyleBackColor = true;
            // 
            // radioButton1
            // 
            this.radioButton1.AutoSize = true;
            this.radioButton1.Location = new System.Drawing.Point(66, 85);
            this.radioButton1.Name = "radioButton1";
            this.radioButton1.Size = new System.Drawing.Size(56, 17);
            this.radioButton1.TabIndex = 11;
            this.radioButton1.TabStop = true;
            this.radioButton1.Text = "As File";
            this.radioButton1.UseVisualStyleBackColor = true;
            // 
            // BrowseButton
            // 
            this.BrowseButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.BrowseButton.Location = new System.Drawing.Point(416, 59);
            this.BrowseButton.Name = "BrowseButton";
            this.BrowseButton.Size = new System.Drawing.Size(78, 23);
            this.BrowseButton.TabIndex = 10;
            this.BrowseButton.Text = "Browse...";
            this.BrowseButton.UseVisualStyleBackColor = true;
            this.BrowseButton.Click += new System.EventHandler(this.BrowseButton_Click);
            // 
            // SaveFileText
            // 
            this.SaveFileText.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.SaveFileText.Location = new System.Drawing.Point(66, 59);
            this.SaveFileText.Name = "SaveFileText";
            this.SaveFileText.ReadOnly = true;
            this.SaveFileText.Size = new System.Drawing.Size(344, 20);
            this.SaveFileText.TabIndex = 9;
            this.SaveFileText.TextChanged += new System.EventHandler(this.SaveFileText_Changed);
            // 
            // SaveFileLabel
            // 
            this.SaveFileLabel.AutoSize = true;
            this.SaveFileLabel.Location = new System.Drawing.Point(6, 64);
            this.SaveFileLabel.Name = "SaveFileLabel";
            this.SaveFileLabel.Size = new System.Drawing.Size(46, 13);
            this.SaveFileLabel.TabIndex = 8;
            this.SaveFileLabel.Text = "Save as";
            // 
            // RefreshPortButton
            // 
            this.RefreshPortButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.RefreshPortButton.BackgroundImage = global::DiveLogUploader.Properties.Resources.faRefresh;
            this.RefreshPortButton.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.RefreshPortButton.Location = new System.Drawing.Point(473, 6);
            this.RefreshPortButton.Name = "RefreshPortButton";
            this.RefreshPortButton.Size = new System.Drawing.Size(21, 21);
            this.RefreshPortButton.TabIndex = 7;
            this.RefreshPortButton.UseVisualStyleBackColor = true;
            this.RefreshPortButton.Click += new System.EventHandler(this.RefreshPortButton_Click);
            // 
            // PortLabel
            // 
            this.PortLabel.AutoSize = true;
            this.PortLabel.Location = new System.Drawing.Point(6, 9);
            this.PortLabel.Name = "PortLabel";
            this.PortLabel.Size = new System.Drawing.Size(55, 13);
            this.PortLabel.TabIndex = 5;
            this.PortLabel.Text = "Serial Port";
            // 
            // PortSelector
            // 
            this.PortSelector.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.PortSelector.FormattingEnabled = true;
            this.PortSelector.Location = new System.Drawing.Point(66, 6);
            this.PortSelector.Name = "PortSelector";
            this.PortSelector.Size = new System.Drawing.Size(401, 21);
            this.PortSelector.TabIndex = 6;
            this.PortSelector.SelectedIndexChanged += new System.EventHandler(this.PortSelector_Changed);
            // 
            // StateLabel
            // 
            this.StateLabel.AutoSize = true;
            this.StateLabel.Location = new System.Drawing.Point(6, 112);
            this.StateLabel.Name = "StateLabel";
            this.StateLabel.Size = new System.Drawing.Size(0, 13);
            this.StateLabel.TabIndex = 4;
            // 
            // StartButton
            // 
            this.StartButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.StartButton.Location = new System.Drawing.Point(416, 112);
            this.StartButton.Name = "StartButton";
            this.StartButton.Size = new System.Drawing.Size(78, 23);
            this.StartButton.TabIndex = 2;
            this.StartButton.Text = "Start";
            this.StartButton.UseVisualStyleBackColor = true;
            this.StartButton.Click += new System.EventHandler(this.StartButton_Click);
            // 
            // Progress
            // 
            this.Progress.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.Progress.Location = new System.Drawing.Point(9, 112);
            this.Progress.Name = "Progress";
            this.Progress.Size = new System.Drawing.Size(401, 23);
            this.Progress.TabIndex = 3;
            this.Progress.Visible = false;
            // 
            // DiversLogTab
            // 
            this.DiversLogTab.Controls.Add(this.flowLayoutPanel1);
            this.DiversLogTab.Location = new System.Drawing.Point(4, 22);
            this.DiversLogTab.Name = "DiversLogTab";
            this.DiversLogTab.Size = new System.Drawing.Size(500, 145);
            this.DiversLogTab.TabIndex = 2;
            this.DiversLogTab.Text = "Divers Log";
            this.DiversLogTab.UseVisualStyleBackColor = true;
            // 
            // flowLayoutPanel1
            // 
            this.flowLayoutPanel1.Controls.Add(this.LoginPanel);
            this.flowLayoutPanel1.Controls.Add(this.AccountPanel);
            this.flowLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.flowLayoutPanel1.Location = new System.Drawing.Point(0, 0);
            this.flowLayoutPanel1.Name = "flowLayoutPanel1";
            this.flowLayoutPanel1.Size = new System.Drawing.Size(500, 145);
            this.flowLayoutPanel1.TabIndex = 0;
            // 
            // LoginPanel
            // 
            this.LoginPanel.Controls.Add(this.AuthErrLabel);
            this.LoginPanel.Controls.Add(this.loginButton);
            this.LoginPanel.Controls.Add(this.label3);
            this.LoginPanel.Controls.Add(this.passwordInput);
            this.LoginPanel.Controls.Add(this.UsernameIput);
            this.LoginPanel.Controls.Add(this.label2);
            this.LoginPanel.Location = new System.Drawing.Point(3, 3);
            this.LoginPanel.Name = "LoginPanel";
            this.LoginPanel.Size = new System.Drawing.Size(247, 139);
            this.LoginPanel.TabIndex = 0;
            this.LoginPanel.TabStop = false;
            this.LoginPanel.Text = "Login";
            // 
            // AuthErrLabel
            // 
            this.AuthErrLabel.AutoSize = true;
            this.AuthErrLabel.Location = new System.Drawing.Point(8, 77);
            this.AuthErrLabel.Name = "AuthErrLabel";
            this.AuthErrLabel.Size = new System.Drawing.Size(0, 13);
            this.AuthErrLabel.TabIndex = 5;
            // 
            // loginButton
            // 
            this.loginButton.Location = new System.Drawing.Point(156, 72);
            this.loginButton.Name = "loginButton";
            this.loginButton.Size = new System.Drawing.Size(75, 23);
            this.loginButton.TabIndex = 4;
            this.loginButton.Text = "Login";
            this.loginButton.UseVisualStyleBackColor = true;
            this.loginButton.Click += new System.EventHandler(this.loginButton_Click);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(8, 49);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(53, 13);
            this.label3.TabIndex = 3;
            this.label3.Text = "Password";
            // 
            // passwordInput
            // 
            this.passwordInput.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.passwordInput.Location = new System.Drawing.Point(69, 46);
            this.passwordInput.Name = "passwordInput";
            this.passwordInput.PasswordChar = '*';
            this.passwordInput.Size = new System.Drawing.Size(162, 20);
            this.passwordInput.TabIndex = 2;
            // 
            // UsernameIput
            // 
            this.UsernameIput.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.UsernameIput.Location = new System.Drawing.Point(69, 20);
            this.UsernameIput.Name = "UsernameIput";
            this.UsernameIput.Size = new System.Drawing.Size(162, 20);
            this.UsernameIput.TabIndex = 1;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(8, 23);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(32, 13);
            this.label2.TabIndex = 0;
            this.label2.Text = "Email";
            // 
            // AccountPanel
            // 
            this.AccountPanel.Controls.Add(this.LabelAccountLastUpload);
            this.AccountPanel.Controls.Add(this.LabelAccountDiveCount);
            this.AccountPanel.Controls.Add(this.LabelAccountName);
            this.AccountPanel.Controls.Add(this.LabelAccountEmail);
            this.AccountPanel.Controls.Add(this.label7);
            this.AccountPanel.Controls.Add(this.label6);
            this.AccountPanel.Controls.Add(this.label5);
            this.AccountPanel.Controls.Add(this.label4);
            this.AccountPanel.Location = new System.Drawing.Point(256, 3);
            this.AccountPanel.Name = "AccountPanel";
            this.AccountPanel.Size = new System.Drawing.Size(236, 139);
            this.AccountPanel.TabIndex = 1;
            this.AccountPanel.TabStop = false;
            this.AccountPanel.Text = "Account";
            this.AccountPanel.Visible = false;
            // 
            // LogTab
            // 
            this.LogTab.Controls.Add(this.LogTextBox);
            this.LogTab.Controls.Add(this.LogLevelSelector);
            this.LogTab.Location = new System.Drawing.Point(4, 22);
            this.LogTab.Name = "LogTab";
            this.LogTab.Padding = new System.Windows.Forms.Padding(3);
            this.LogTab.Size = new System.Drawing.Size(500, 145);
            this.LogTab.TabIndex = 1;
            this.LogTab.Text = "Log";
            this.LogTab.UseVisualStyleBackColor = true;
            // 
            // LogTextBox
            // 
            this.LogTextBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.LogTextBox.Location = new System.Drawing.Point(3, 24);
            this.LogTextBox.Name = "LogTextBox";
            this.LogTextBox.ReadOnly = true;
            this.LogTextBox.Size = new System.Drawing.Size(494, 118);
            this.LogTextBox.TabIndex = 0;
            this.LogTextBox.Text = "";
            // 
            // LogLevelSelector
            // 
            this.LogLevelSelector.Dock = System.Windows.Forms.DockStyle.Top;
            this.LogLevelSelector.FormattingEnabled = true;
            this.LogLevelSelector.Location = new System.Drawing.Point(3, 3);
            this.LogLevelSelector.Name = "LogLevelSelector";
            this.LogLevelSelector.Size = new System.Drawing.Size(494, 21);
            this.LogLevelSelector.TabIndex = 1;
            this.LogLevelSelector.SelectedValueChanged += new System.EventHandler(this.LogLevelSelector_SelectedValueChanged);
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.tabControl1);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel1.Location = new System.Drawing.Point(0, 0);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(508, 171);
            this.panel1.TabIndex = 2;
            // 
            // panel2
            // 
            this.panel2.Controls.Add(this.VersionLabel);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.panel2.Location = new System.Drawing.Point(0, 171);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(508, 24);
            this.panel2.TabIndex = 0;
            // 
            // DivecomputerWorker
            // 
            this.DivecomputerWorker.DoWork += new System.ComponentModel.DoWorkEventHandler(this.DivecomputerWorker_DoWork);
            this.DivecomputerWorker.RunWorkerCompleted += new System.ComponentModel.RunWorkerCompletedEventHandler(this.DivecomputerWorker_RunWorkerCompleted);
            // 
            // SaveFileDialog
            // 
            this.SaveFileDialog.Filter = "JSON Files (*.json)|*.json";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(7, 22);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(32, 13);
            this.label4.TabIndex = 0;
            this.label4.Text = "Email";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Location = new System.Drawing.Point(7, 46);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(35, 13);
            this.label5.TabIndex = 1;
            this.label5.Text = "Name";
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(7, 72);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(59, 13);
            this.label6.TabIndex = 2;
            this.label6.Text = "Dive count";
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(7, 98);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(62, 13);
            this.label7.TabIndex = 3;
            this.label7.Text = "Last upload";
            // 
            // LabelAccountEmail
            // 
            this.LabelAccountEmail.AutoSize = true;
            this.LabelAccountEmail.Location = new System.Drawing.Point(102, 23);
            this.LabelAccountEmail.Name = "LabelAccountEmail";
            this.LabelAccountEmail.Size = new System.Drawing.Size(32, 13);
            this.LabelAccountEmail.TabIndex = 4;
            this.LabelAccountEmail.Text = "Email";
            // 
            // LabelAccountName
            // 
            this.LabelAccountName.AutoSize = true;
            this.LabelAccountName.Location = new System.Drawing.Point(102, 46);
            this.LabelAccountName.Name = "LabelAccountName";
            this.LabelAccountName.Size = new System.Drawing.Size(35, 13);
            this.LabelAccountName.TabIndex = 5;
            this.LabelAccountName.Text = "Name";
            // 
            // LabelAccountDiveCount
            // 
            this.LabelAccountDiveCount.AutoSize = true;
            this.LabelAccountDiveCount.Location = new System.Drawing.Point(102, 72);
            this.LabelAccountDiveCount.Name = "LabelAccountDiveCount";
            this.LabelAccountDiveCount.Size = new System.Drawing.Size(35, 13);
            this.LabelAccountDiveCount.TabIndex = 6;
            this.LabelAccountDiveCount.Text = "Count";
            // 
            // LabelAccountLastUpload
            // 
            this.LabelAccountLastUpload.AutoSize = true;
            this.LabelAccountLastUpload.Location = new System.Drawing.Point(102, 98);
            this.LabelAccountLastUpload.Name = "LabelAccountLastUpload";
            this.LabelAccountLastUpload.Size = new System.Drawing.Size(64, 13);
            this.LabelAccountLastUpload.TabIndex = 7;
            this.LabelAccountLastUpload.Text = "Last Upload";
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.ClientSize = new System.Drawing.Size(508, 195);
            this.Controls.Add(this.panel1);
            this.Controls.Add(this.panel2);
            this.MaximizeBox = false;
            this.Name = "Form1";
            this.Text = "DiveLogUploader";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.tabControl1.ResumeLayout(false);
            this.ComputerTab.ResumeLayout(false);
            this.ComputerTab.PerformLayout();
            this.DiversLogTab.ResumeLayout(false);
            this.flowLayoutPanel1.ResumeLayout(false);
            this.LoginPanel.ResumeLayout(false);
            this.LoginPanel.PerformLayout();
            this.AccountPanel.ResumeLayout(false);
            this.AccountPanel.PerformLayout();
            this.LogTab.ResumeLayout(false);
            this.panel1.ResumeLayout(false);
            this.panel2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Label ComputerSelectLabel;
        private System.Windows.Forms.ComboBox ComputerSelector;
        private System.Windows.Forms.Label VersionLabel;
        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage ComputerTab;
        private System.Windows.Forms.TabPage LogTab;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.Panel panel2;
        private System.Windows.Forms.Button StartButton;
        private System.Windows.Forms.ProgressBar Progress;
        private System.Windows.Forms.Label StateLabel;
        private System.Windows.Forms.RichTextBox LogTextBox;
        private System.Windows.Forms.ComboBox LogLevelSelector;
        private System.Windows.Forms.Label PortLabel;
        private System.Windows.Forms.ComboBox PortSelector;
        private System.Windows.Forms.Button RefreshPortButton;
        private System.ComponentModel.BackgroundWorker DivecomputerWorker;
        private System.Windows.Forms.Label SaveFileLabel;
        private System.Windows.Forms.TextBox SaveFileText;
        private System.Windows.Forms.SaveFileDialog SaveFileDialog;
        private System.Windows.Forms.Button BrowseButton;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.RadioButton radioButton2;
        private System.Windows.Forms.RadioButton radioButton1;
        private System.Windows.Forms.TabPage DiversLogTab;
        private System.Windows.Forms.FlowLayoutPanel flowLayoutPanel1;
        private System.Windows.Forms.GroupBox LoginPanel;
        private System.Windows.Forms.GroupBox AccountPanel;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox passwordInput;
        private System.Windows.Forms.TextBox UsernameIput;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button loginButton;
        private System.Windows.Forms.Label AuthErrLabel;
        private System.Windows.Forms.Label LabelAccountLastUpload;
        private System.Windows.Forms.Label LabelAccountDiveCount;
        private System.Windows.Forms.Label LabelAccountName;
        private System.Windows.Forms.Label LabelAccountEmail;
        private System.Windows.Forms.Label label7;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.Label label4;
    }
}

