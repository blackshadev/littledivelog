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
            this.tabPage1 = new System.Windows.Forms.TabPage();
            this.RefreshPortButton = new System.Windows.Forms.Button();
            this.PortLabel = new System.Windows.Forms.Label();
            this.PortSelector = new System.Windows.Forms.ComboBox();
            this.StateLabel = new System.Windows.Forms.Label();
            this.StartButton = new System.Windows.Forms.Button();
            this.Progress = new System.Windows.Forms.ProgressBar();
            this.tabPage2 = new System.Windows.Forms.TabPage();
            this.LogTextBox = new System.Windows.Forms.RichTextBox();
            this.LogLevelSelector = new System.Windows.Forms.ComboBox();
            this.panel1 = new System.Windows.Forms.Panel();
            this.panel2 = new System.Windows.Forms.Panel();
            this.tabControl1.SuspendLayout();
            this.tabPage1.SuspendLayout();
            this.tabPage2.SuspendLayout();
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
            this.ComputerSelector.Size = new System.Drawing.Size(207, 21);
            this.ComputerSelector.TabIndex = 1;
            // 
            // VersionLabel
            // 
            this.VersionLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.VersionLabel.Location = new System.Drawing.Point(0, 0);
            this.VersionLabel.Name = "VersionLabel";
            this.VersionLabel.Size = new System.Drawing.Size(289, 24);
            this.VersionLabel.TabIndex = 2;
            this.VersionLabel.Text = "_version_";
            this.VersionLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // tabControl1
            // 
            this.tabControl1.Controls.Add(this.tabPage1);
            this.tabControl1.Controls.Add(this.tabPage2);
            this.tabControl1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tabControl1.Location = new System.Drawing.Point(0, 0);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(289, 138);
            this.tabControl1.TabIndex = 3;
            // 
            // tabPage1
            // 
            this.tabPage1.Controls.Add(this.RefreshPortButton);
            this.tabPage1.Controls.Add(this.PortLabel);
            this.tabPage1.Controls.Add(this.PortSelector);
            this.tabPage1.Controls.Add(this.StateLabel);
            this.tabPage1.Controls.Add(this.StartButton);
            this.tabPage1.Controls.Add(this.Progress);
            this.tabPage1.Controls.Add(this.ComputerSelectLabel);
            this.tabPage1.Controls.Add(this.ComputerSelector);
            this.tabPage1.Location = new System.Drawing.Point(4, 22);
            this.tabPage1.Name = "tabPage1";
            this.tabPage1.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage1.Size = new System.Drawing.Size(281, 112);
            this.tabPage1.TabIndex = 0;
            this.tabPage1.Text = "Computer";
            this.tabPage1.UseVisualStyleBackColor = true;
            // 
            // RefreshPortButton
            // 
            this.RefreshPortButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.RefreshPortButton.BackgroundImage = global::DiveLogUploader.Properties.Resources.faRefresh;
            this.RefreshPortButton.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.RefreshPortButton.Location = new System.Drawing.Point(254, 6);
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
            this.PortSelector.Size = new System.Drawing.Size(182, 21);
            this.PortSelector.TabIndex = 6;
            // 
            // StateLabel
            // 
            this.StateLabel.AutoSize = true;
            this.StateLabel.Location = new System.Drawing.Point(8, 60);
            this.StateLabel.Name = "StateLabel";
            this.StateLabel.Size = new System.Drawing.Size(0, 13);
            this.StateLabel.TabIndex = 4;
            // 
            // StartButton
            // 
            this.StartButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.StartButton.Location = new System.Drawing.Point(198, 60);
            this.StartButton.Name = "StartButton";
            this.StartButton.Size = new System.Drawing.Size(75, 23);
            this.StartButton.TabIndex = 2;
            this.StartButton.Text = "Start";
            this.StartButton.UseVisualStyleBackColor = true;
            this.StartButton.Click += new System.EventHandler(this.StartButton_Click);
            // 
            // Progress
            // 
            this.Progress.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.Progress.Location = new System.Drawing.Point(9, 60);
            this.Progress.Name = "Progress";
            this.Progress.Size = new System.Drawing.Size(183, 23);
            this.Progress.TabIndex = 3;
            this.Progress.Visible = false;
            // 
            // tabPage2
            // 
            this.tabPage2.Controls.Add(this.LogTextBox);
            this.tabPage2.Controls.Add(this.LogLevelSelector);
            this.tabPage2.Location = new System.Drawing.Point(4, 22);
            this.tabPage2.Name = "tabPage2";
            this.tabPage2.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage2.Size = new System.Drawing.Size(281, 112);
            this.tabPage2.TabIndex = 1;
            this.tabPage2.Text = "Log";
            this.tabPage2.UseVisualStyleBackColor = true;
            // 
            // LogTextBox
            // 
            this.LogTextBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.LogTextBox.Location = new System.Drawing.Point(3, 24);
            this.LogTextBox.Name = "LogTextBox";
            this.LogTextBox.ReadOnly = true;
            this.LogTextBox.Size = new System.Drawing.Size(275, 85);
            this.LogTextBox.TabIndex = 0;
            this.LogTextBox.Text = "";
            // 
            // LogLevelSelector
            // 
            this.LogLevelSelector.Dock = System.Windows.Forms.DockStyle.Top;
            this.LogLevelSelector.FormattingEnabled = true;
            this.LogLevelSelector.Location = new System.Drawing.Point(3, 3);
            this.LogLevelSelector.Name = "LogLevelSelector";
            this.LogLevelSelector.Size = new System.Drawing.Size(275, 21);
            this.LogLevelSelector.TabIndex = 1;
            this.LogLevelSelector.SelectedValueChanged += new System.EventHandler(this.LogLevelSelector_SelectedValueChanged);
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.tabControl1);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel1.Location = new System.Drawing.Point(0, 0);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(289, 138);
            this.panel1.TabIndex = 2;
            // 
            // panel2
            // 
            this.panel2.Controls.Add(this.VersionLabel);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.panel2.Location = new System.Drawing.Point(0, 138);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(289, 24);
            this.panel2.TabIndex = 0;
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.AutoSizeMode = System.Windows.Forms.AutoSizeMode.GrowAndShrink;
            this.ClientSize = new System.Drawing.Size(289, 162);
            this.Controls.Add(this.panel1);
            this.Controls.Add(this.panel2);
            this.MaximizeBox = false;
            this.Name = "Form1";
            this.Text = "DiveLogUploader";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.tabControl1.ResumeLayout(false);
            this.tabPage1.ResumeLayout(false);
            this.tabPage1.PerformLayout();
            this.tabPage2.ResumeLayout(false);
            this.panel1.ResumeLayout(false);
            this.panel2.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Label ComputerSelectLabel;
        private System.Windows.Forms.ComboBox ComputerSelector;
        private System.Windows.Forms.Label VersionLabel;
        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage tabPage1;
        private System.Windows.Forms.TabPage tabPage2;
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
    }
}

