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
            this.LabelVersion = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // ComputerSelectLabel
            // 
            this.ComputerSelectLabel.AutoSize = true;
            this.ComputerSelectLabel.Location = new System.Drawing.Point(12, 9);
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
            this.ComputerSelector.Location = new System.Drawing.Point(70, 6);
            this.ComputerSelector.Name = "ComputerSelector";
            this.ComputerSelector.Size = new System.Drawing.Size(204, 21);
            this.ComputerSelector.TabIndex = 1;
            // 
            // LabelVersion
            // 
            this.LabelVersion.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.LabelVersion.Location = new System.Drawing.Point(12, 220);
            this.LabelVersion.Name = "LabelVersion";
            this.LabelVersion.Size = new System.Drawing.Size(262, 23);
            this.LabelVersion.TabIndex = 2;
            this.LabelVersion.Text = "_version_";
            this.LabelVersion.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(286, 245);
            this.Controls.Add(this.LabelVersion);
            this.Controls.Add(this.ComputerSelector);
            this.Controls.Add(this.ComputerSelectLabel);
            this.Name = "Form1";
            this.Text = "Form1";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Label ComputerSelectLabel;
        private System.Windows.Forms.ComboBox ComputerSelector;
        private System.Windows.Forms.Label LabelVersion;
    }
}

