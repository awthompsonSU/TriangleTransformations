import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

public class LabelTest extends JPanel{
    private JLabel label1, label2, label3;
    JTextField num1,num2,num3;
    JButton plainButton1, plainButton2;
    static String textIn="";
	    
    public LabelTest() {
        //super("Fire Label");
        
        //Container c=getContentPane();
        setLayout(new FlowLayout());
        
        label1=new JLabel("Fire:");
        label1.setToolTipText("Enter Starting location to fire");
        //add(label1);
        
        num1 = new JTextField(4);           //text field
        add(num1);
        
        plainButton1 = new JButton( "Fire");
        add(plainButton1);
	label2=new JLabel("Guess:");
	label2.setToolTipText("Enter coordinates to guess baffle");
        //add(label2);
        
        num2 = new JTextField(4);           //text field
        add(num2);
	plainButton2 = new JButton( "Guess");
        add(plainButton2);

	ButtonHandler handler= new ButtonHandler();
	plainButton1.addActionListener(handler);
	plainButton2.addActionListener(handler);
        //setSize(200,170);
        //show();
    }
	private class ButtonHandler implements ActionListener
	{
		public void actionPerformed(ActionEvent event)
		{
			
			if(event.getSource()==plainButton1)
				textIn=num1.getText();
			else if(event.getSource()==plainButton2)
				textIn=num2.getText();
			JOptionPane.showMessageDialog(null,textIn);
		}
	}
	public String getInput()
	{
		return textIn;
	}
}

